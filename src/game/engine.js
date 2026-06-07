/**
 * MÓDULO DA GAME ENGINE - RPG INTERATIVO CYBERPUNK
 * Lógica pura de jogo, desacoplada de frameworks de interface.
 */

// Importa dados do catálogo de forma dinâmica ou estática se necessário.
// Como roda no node e no vite, podemos expor funções puras que recebem o catálogo se necessário,
// ou carregar o catálogo de forma injetada. Vamos passar o catálogo como parâmetro opcional
// ou usar valores default baseados no catálogo de teste para maior facilidade e acoplamento fraco.

/**
 * Calcula o modificador de atributo clássico do sistema D20.
 * Fórmula: Math.floor((atributo - 10) / 2)
 */
export function getAttributeModifier(attributeValue) {
  return Math.floor((attributeValue - 10) / 2);
}

/**
 * Inicializa o estado global do jogo (GameState).
 * @param {Object} characterConfig Configurações do personagem { name, classId }
 * @param {Object} catalog O objeto completo catalog.json
 * @returns {Object} GameState inicial
 */
export function initializeGame(characterConfig, catalog, options = {}) {
  const { name, classId, attributes } = characterConfig;
  const { startSceneId, extraItems } = options;

  // Busca a classe no catálogo para obter atributos base e itens iniciais
  const characterClass = catalog.classes.find(c => c.id === classId) || catalog.classes[0];

  // Se foram fornecidos atributos customizados (ex: da criação de personagem), usa-os.
  // Caso contrário, usa os atributos padrão da classe.
  const baseAttributes = attributes ? { ...attributes } : { ...characterClass.baseAttributes };
  
  // Atributos de Vida:
  // HP máximo = Físico (PHY) * 10
  // Sanidade máxima = Vontade (WIL) * 10
  const maxHp = baseAttributes.PHY * 10;
  const maxSanity = baseAttributes.WIL * 10;

  const inventory = [...characterClass.startingItems];
  if (extraItems && Array.isArray(extraItems)) {
    inventory.push(...extraItems);
  }

  return {
    player: {
      name: name || "Cyber-Runner",
      classId: characterClass.id,
      attributes: baseAttributes,
      hp: maxHp,
      maxHp: maxHp,
      sanity: maxSanity,
      maxSanity: maxSanity
    },
    inventory: inventory,
    currentSceneId: startSceneId || "cena_inicio",
    flags: {}
  };
}

/**
 * Pipeline central da Game Engine: Processa a ação e transiciona o estado.
 * Executa as 8 fases lógicas do motor.
 * 
 * @param {Object} currentState Estado atual do jogo (GameState)
 * @param {Object} option Opção selecionada pelo jogador
 * @param {number|null} diceRollOverride Força o resultado do dado (para testes)
 * @returns {Object} { nextState, transitionMeta }
 */
export function processAction(currentState, option, diceRollOverride = null) {
  // Cria cópias profundas simples para garantir imutabilidade
  const nextState = JSON.parse(JSON.stringify(currentState));
  
  const transitionMeta = {
    optionId: option.id,
    optionText: option.text,
    diceRoll: null,
    diceResult: null, // "success", "failure", "critical_success", "critical_failure"
    modifiedRoll: null,
    attributeUsed: null,
    modifier: 0,
    dc: null,
    effectsApplied: [],
    message: ""
  };

  // ==========================================
  // FASE 1: VALIDAÇÃO DE REQUISITOS (REQUIREMENTS)
  // ==========================================
  if (option.requirements) {
    const { classId, itemId } = option.requirements;
    if (classId && nextState.player.classId !== classId) {
      throw new Error(`Requisito de classe não atendido: exige ${classId}`);
    }
    if (itemId && !nextState.inventory.includes(itemId)) {
      throw new Error(`Requisito de item não atendido: exige ${itemId}`);
    }
  }

  // ==========================================
  // FASE 2: CONSUMO DE RECURSOS / CUSTOS
  // ==========================================
  // (Caso opções de custo de vida sejam adicionadas no futuro, ex: pagar créditos)

  // ==========================================
  // FASE 3: EXECUÇÃO DE TESTE DE ATRIBUTO (CHECK)
  // ==========================================
  let targetSceneId = option.targetScene;

  if (option.check) {
    const { attribute, DC, successScene, failureScene } = option.check;
    const playerAttr = nextState.player.attributes[attribute] || 10;
    const modifier = getAttributeModifier(playerAttr);

    // Rola o D20 (1-20) ou usa o override
    const roll = diceRollOverride !== null ? diceRollOverride : Math.floor(Math.random() * 20) + 1;
    const modifiedRoll = roll + modifier;

    transitionMeta.diceRoll = roll;
    transitionMeta.modifier = modifier;
    transitionMeta.modifiedRoll = modifiedRoll;
    transitionMeta.attributeUsed = attribute;
    transitionMeta.dc = DC;

    if (roll === 20) {
      transitionMeta.diceResult = "critical_success";
      targetSceneId = successScene;
      transitionMeta.message = `SUCESSO CRÍTICO! Rolo natural 20 no teste de ${attribute} (Total: ${modifiedRoll} vs DC ${DC}).`;
    } else if (roll === 1) {
      transitionMeta.diceResult = "critical_failure";
      targetSceneId = failureScene;
      transitionMeta.message = `FALHA CRÍTICA! Rolo natural 1 no teste de ${attribute} (Total: ${modifiedRoll} vs DC ${DC}).`;
    } else if (modifiedRoll >= DC) {
      transitionMeta.diceResult = "success";
      targetSceneId = successScene;
      transitionMeta.message = `Sucesso! Rolou ${roll} + modificador ${modifier >= 0 ? '+' : ''}${modifier} = ${modifiedRoll} no teste de ${attribute} (DC ${DC}).`;
    } else {
      transitionMeta.diceResult = "failure";
      targetSceneId = failureScene;
      transitionMeta.message = `Falha! Rolou ${roll} + modificador ${modifier >= 0 ? '+' : ''}${modifier} = ${modifiedRoll} no teste de ${attribute} (DC ${DC}).`;
    }
  } else {
    transitionMeta.message = `Navegou para a cena: ${targetSceneId}`;
  }

  // ==========================================
  // FASE 4: RESOLUÇÃO DE DESTINO (MUDANÇA DE CENA)
  // ==========================================
  nextState.currentSceneId = targetSceneId;

  // ==========================================
  // FASE 5: APLICAÇÃO DE EFEITOS (EFFECTS)
  // ==========================================
  if (option.effects) {
    const { gainItems, loseItems, loseHP, loseSanity, clearInventory, setFlags } = option.effects;

    // Itens Ganhados
    if (gainItems && Array.isArray(gainItems)) {
      gainItems.forEach(item => {
        nextState.inventory.push(item);
        transitionMeta.effectsApplied.push(`Ganhou item: ${item}`);
      });
    }

    // Itens Perdidos
    if (loseItems && Array.isArray(loseItems)) {
      loseItems.forEach(item => {
        const idx = nextState.inventory.indexOf(item);
        if (idx !== -1) {
          nextState.inventory.splice(idx, 1);
          transitionMeta.effectsApplied.push(`Perdeu item: ${item}`);
        }
      });
    }

    // Limpar inventário
    if (clearInventory) {
      nextState.inventory = [];
      transitionMeta.effectsApplied.push("Inventário limpo");
    }

    // Perda de HP
    if (loseHP) {
      nextState.player.hp -= loseHP;
      transitionMeta.effectsApplied.push(`Perdeu ${loseHP} HP`);
    }

    // Perda de Sanidade
    if (loseSanity) {
      nextState.player.sanity -= loseSanity;
      transitionMeta.effectsApplied.push(`Perdeu ${loseSanity} de Sanidade`);
    }

    // Ativação de Flags do mundo
    if (setFlags && typeof setFlags === 'object') {
      Object.entries(setFlags).forEach(([key, value]) => {
        nextState.flags[key] = value;
        transitionMeta.effectsApplied.push(`Flag alterada: ${key} = ${value}`);
      });
    }
  }

  // ==========================================
  // FASE 6: CLAMPING DE ATRIBUTOS
  // ==========================================
  nextState.player.hp = Math.max(0, Math.min(nextState.player.maxHp, nextState.player.hp));
  nextState.player.sanity = Math.max(0, Math.min(nextState.player.maxSanity, nextState.player.sanity));

  // ==========================================
  // FASE 7: VERIFICAÇÃO DE GAME OVER AUTOMÁTICO (SYSTEM TRIGGERS)
  // ==========================================
  if (nextState.player.hp <= 0) {
    nextState.currentSceneId = "cena_game_over";
    transitionMeta.message += " [HP ZERADO - GAME OVER FÍSICO]";
  } else if (nextState.player.sanity <= 0) {
    nextState.currentSceneId = "cena_game_over";
    transitionMeta.message += " [SANIDADE ZERADA - GAME OVER MENTAL]";
  }

  // ==========================================
  // FASE 8: RETORNO DE NOVO ESTADO E METADADOS
  // ==========================================
  return {
    nextState,
    transitionMeta
  };
}
