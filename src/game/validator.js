/**
 * VALIDADOR DE GRAFO DE CENAS
 * Verifica integridade estrutural e previne referências órfãs no world.json.
 */

/**
 * Varre o worldJson à procura de incongruências lógicas e órfãos.
 * @param {Object} worldJson O objeto bruto do world.json
 * @returns {Array<string>} Lista de strings contendo mensagens de erro (vazia se o grafo for válido)
 */
export function validateGraph(worldJson) {
  const errors = [];
  const scenes = worldJson.scenes || [];
  
  // 1. Mapeia todos os IDs de cenas existentes para busca rápida
  const sceneIds = new Set();
  const duplicateIds = new Set();

  scenes.forEach(scene => {
    if (!scene.id) {
      errors.push("Erro Estrutural: Encontrada cena sem propriedade 'id'.");
      return;
    }
    if (sceneIds.has(scene.id)) {
      duplicateIds.add(scene.id);
    }
    sceneIds.add(scene.id);
  });

  duplicateIds.forEach(id => {
    errors.push(`Erro de Duplicidade: O ID de cena '${id}' está duplicado no grafo.`);
  });

  // 2. Valida as transições de cada opção
  scenes.forEach(scene => {
    if (!scene.options || !Array.isArray(scene.options)) {
      errors.push(`Aviso de Fluxo: A cena '${scene.id}' não possui opções válidas.`);
      return;
    }

    scene.options.forEach((option, idx) => {
      const optionLabel = `Opção [idx: ${idx}, id: '${option.id || "n/a"}'] da cena '${scene.id}'`;

      // Valida destino normal
      if (option.targetScene) {
        if (!sceneIds.has(option.targetScene)) {
          errors.push(`${optionLabel} aponta para um targetScene inexistente: '${option.targetScene}'.`);
        }
      } else if (!option.check) {
        // Se não tem targetScene e não é um check, é um erro estrutural
        errors.push(`${optionLabel} não possui propriedade 'targetScene' nem configurações de 'check'.`);
      }

      // Valida destinos do teste (Check)
      if (option.check) {
        const { attribute, DC, successScene, failureScene } = option.check;

        if (!attribute) {
          errors.push(`${optionLabel} possui 'check' mas não especifica o 'attribute'.`);
        }
        if (typeof DC !== 'number') {
          errors.push(`${optionLabel} possui 'check' mas o 'DC' não é um número válido.`);
        }

        if (!successScene) {
          errors.push(`${optionLabel} possui 'check' mas está sem 'successScene'.`);
        } else if (!sceneIds.has(successScene)) {
          errors.push(`${optionLabel} (Check - Sucesso) aponta para cena inexistente: '${successScene}'.`);
        }

        if (!failureScene) {
          errors.push(`${optionLabel} possui 'check' mas está sem 'failureScene'.`);
        } else if (!sceneIds.has(failureScene)) {
          errors.push(`${optionLabel} (Check - Falha) aponta para cena inexistente: '${failureScene}'.`);
        }
      }
    });
  });

  return errors;
}
