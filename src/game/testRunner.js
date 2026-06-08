import fs from 'fs';
import { initializeGame, processAction, checkRequirements } from './engine.js';
import { validateGraph } from './validator.js';

// Função auxiliar para carregar JSON
function loadJson(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao carregar o arquivo ${filePath}:`, error.message);
    process.exit(1);
  }
}

console.log("=== RUNNER DE TESTES DA GAME ENGINE: INICIANDO ===");

// 1. Carregar dados
const catalog = loadJson('./public/data/catalog.json');
const world = loadJson('./public/data/world.json');

console.log("✓ Catálogo e Grafo de cenas carregados com sucesso.");

// 2. Executar Validação de Grafo Válido
console.log("\n--- TESTE 1: Validação do Grafo Original ---");
const initialValidationErrors = validateGraph(world);
if (initialValidationErrors.length === 0) {
  console.log("✓ Grafo original validado sem nenhum erro estrutural.");
} else {
  console.error("✗ Erro inesperado ao validar o grafo original:", initialValidationErrors);
  process.exit(1);
}

// 3. Executar Validação com Grafo Inválido (Erro Induzido)
console.log("\n--- TESTE 2: Indução de Erros no Grafo (Validador) ---");
const corruptedWorld = JSON.parse(JSON.stringify(world));
// Adiciona cena duplicada e altera um targetScene para um id inexistente
corruptedWorld.scenes.push({
  id: "cena_inicio", // Duplicado
  title: "Cena Duplicada",
  body: "Cena de teste de erro",
  options: []
});
// Altera a opção da primeira cena para apontar para um órfão
corruptedWorld.scenes[0].options[0].targetScene = "cena_fantasma_invalida";

const validationErrors = validateGraph(corruptedWorld);
console.log(`Erros detectados pelo validador (Esperado: 2+): ${validationErrors.length}`);
validationErrors.forEach(err => console.log(`  [DETECTADO] ${err}`));

if (validationErrors.length >= 2) {
  console.log("✓ O validador detectou corretamente as referências órfãs e duplicidades induzidas.");
} else {
  console.error("✗ O validador falhou em detectar os erros induzidos.");
  process.exit(1);
}

// 4. Testar Inicialização do Jogo
console.log("\n--- TESTE 3: Inicialização de Personagens ---");
const soloState = initializeGame({ name: "V", classId: "solo" }, catalog);
const runnerState = initializeGame({ name: "Alt", classId: "netrunner" }, catalog);

console.log(`✓ Solo inicializado: Nome=${soloState.player.name}, HP=${soloState.player.hp}/${soloState.player.maxHp}, Itens=${soloState.inventory.join(', ')}`);
console.log(`✓ Netrunner inicializado: Nome=${runnerState.player.name}, HP=${runnerState.player.hp}/${runnerState.player.maxHp}, Itens=${runnerState.inventory.join(', ')}`);

// 5. Simular Jogo: Fluxo com Sucesso de Check (Override do D20 = 15)
console.log("\n--- TESTE 4: Simulação de Sucesso no Check (D20 = 15) ---");
// Começa na cena_inicio
let state = initializeGame({ name: "V", classId: "solo" }, catalog);
console.log(`Cena Inicial: ${state.currentSceneId}`);

// Encontra a opção "ir_ao_reservado" na cena_inicio
const sceneInicio = world.scenes.find(s => s.id === state.currentSceneId);
const option1 = sceneInicio.options.find(o => o.id === "ir_ao_reservado");

let result = processAction(state, option1, catalog, world);
state = result.nextState;
console.log(`-> Escolheu: "${option1.text}"`);
console.log(`   Nova cena: ${state.currentSceneId}`);
console.log(`   Efeitos aplicados: ${result.transitionMeta.effectsApplied.join(', ') || 'Nenhum'}`);
console.log(`   Sanidade do Jogador: ${state.player.sanity}/${state.player.maxSanity}`);

// Estamos no beco. Vamos testar "desarmar_capanga" com um rolo bem-sucedido de D20 = 15
const sceneBeco = world.scenes.find(s => s.id === state.currentSceneId);
const optionDesarmar = sceneBeco.options.find(o => o.id === "desarmar_capanga");

// Força D20 = 15. Modificador do Solo para Reflexos (REF: 9) é Math.floor((9 - 10)/2) = -1.
// Total: 15 - 1 = 14. DC do teste é 12. Sucesso esperado!
result = processAction(state, optionDesarmar, catalog, world, 15);
state = result.nextState;

console.log(`-> Escolheu: "${optionDesarmar.text}"`);
console.log(`   Resultado do Rolo: ${result.transitionMeta.message}`);
console.log(`   Nova cena: ${state.currentSceneId} (Esperado: cena_sucesso)`);
console.log(`   HP do Jogador: ${state.player.hp}/${state.player.maxHp}`);

if (state.currentSceneId === "cena_sucesso") {
  console.log("✓ Simulação de sucesso no Check concluída com êxito.");
} else {
  console.error("✗ Falha na transição de sucesso do Check.");
  process.exit(1);
}

// 6. Simular Jogo: Fluxo com Falha de Check (Override do D20 = 5)
console.log("\n--- TESTE 5: Simulação de Falha no Check (D20 = 5) ---");
state = initializeGame({ name: "V", classId: "solo" }, catalog);
result = processAction(state, option1, catalog, world);
state = result.nextState;

// Força D20 = 5. Total: 5 - 1 = 4. DC 12. Falha esperada!
result = processAction(state, optionDesarmar, catalog, world, 5);
state = result.nextState;

console.log(`-> Escolheu: "${optionDesarmar.text}"`);
console.log(`   Resultado do Rolo: ${result.transitionMeta.message}`);
console.log(`   Nova cena: ${state.currentSceneId} (Esperado: cena_game_over)`);
console.log(`   HP do Jogador: ${state.player.hp}/${state.player.maxHp}`);

if (state.currentSceneId === "cena_game_over") {
  console.log("✓ Simulação de falha no Check concluída com êxito.");
} else {
  console.error("✗ Falha na transição de falha do Check.");
  process.exit(1);
}

// 7. Simular Requisitos (Requirements)
console.log("\n--- TESTE 6: Validação de Requisitos (Netrunner) ---");
// Criamos um Netrunner (possui classe netrunner e cyberdeck_basico no inventário inicial)
let netrunnerState = initializeGame({ name: "Alt", classId: "netrunner" }, catalog);

// Move para a cena_beco
const optionIrReservado = sceneInicio.options.find(o => o.id === "ir_ao_reservado");
result = processAction(netrunnerState, optionIrReservado, catalog, world);
netrunnerState = result.nextState;

// Na cena beco, escolhe "hackear_cyberdeck" (exige netrunner + cyberdeck_basico)
const optionHack = sceneBeco.options.find(o => o.id === "hackear_cyberdeck");

// Deve processar com sucesso
result = processAction(netrunnerState, optionHack, catalog, world);
netrunnerState = result.nextState;
console.log(`-> Netrunner escolheu: "${optionHack.text}"`);
console.log(`   Nova cena: ${netrunnerState.currentSceneId} (Esperado: cena_hack)`);

if (netrunnerState.currentSceneId === "cena_hack") {
  console.log("✓ Opção condicional por classe/item executada com sucesso.");
} else {
  console.error("✗ Falha ao validar opção restrita.");
  process.exit(1);
}

// 8. Tentar acionar opção bloqueada de outro personagem (Deve lançar Erro)
console.log("\n--- TESTE 7: Segurança da Engine contra escolhas bloqueadas ---");
let soloNoBeco = initializeGame({ name: "V", classId: "solo" }, catalog);
soloNoBeco = processAction(soloNoBeco, optionIrReservado, catalog, world).nextState;

try {
  // Solo tenta usar o hack (bloqueado para classe netrunner)
  processAction(soloNoBeco, optionHack, catalog, world);
  console.error("✗ ERRO: A engine permitiu que um Solo fizesse uma ação de Netrunner!");
  process.exit(1);
} catch (err) {
  console.log(`✓ Sucesso! A engine bloqueou a ação inválida lançando o erro: "${err.message}"`);
}

// 9. Testar Novo Fluxo de Exploração do Balcão (Interface Hack)
console.log("\n--- TESTE 8: Novo Fluxo de Hacking no Balcão (Atributo INT) ---");
let runnerBalcao = initializeGame({ name: "Alt", classId: "netrunner" }, catalog);
const sceneInicioNova = world.scenes.find(s => s.id === runnerBalcao.currentSceneId);
const optionIrBalcao = sceneInicioNova.options.find(o => o.id === "ir_ao_balcao");

let actionResult = processAction(runnerBalcao, optionIrBalcao, catalog, world);
runnerBalcao = actionResult.nextState;
console.log(`-> Escolheu: "${optionIrBalcao.text}"`);
console.log(`   Nova cena: ${runnerBalcao.currentSceneId} (Esperado: cena_balcao_investigar)`);

const sceneBalcao = world.scenes.find(s => s.id === runnerBalcao.currentSceneId);
const optionHackBalcao = sceneBalcao.options.find(o => o.id === "hackear_balcao");

// Força D20 = 18. Interface (INT: 10) -> mod 0. Total 18 vs DC 12. Sucesso!
actionResult = processAction(runnerBalcao, optionHackBalcao, catalog, world, 18);
runnerBalcao = actionResult.nextState;
console.log(`   Resultado do Rolo: ${actionResult.transitionMeta.message}`);
console.log(`   Nova cena: ${runnerBalcao.currentSceneId} (Esperado: cena_balcao_sucesso)`);

if (runnerBalcao.currentSceneId === "cena_balcao_sucesso") {
  console.log("✓ Teste de Hacking no balcão passou com sucesso.");
} else {
  console.error("✗ Falha no teste de hacking do balcão.");
  process.exit(1);
}

// 10. Testar Fuga com Jack-Knife (Suborno com item e ganho de passaporte)
console.log("\n--- TESTE 9: Negociação com Jack-Knife (Consumo de item e ganho de passaporte) ---");
let runnerJack = initializeGame({ name: "Alt", classId: "netrunner" }, catalog); // Começa com chip_cripto
const optionFalarJack = sceneInicioNova.options.find(o => o.id === "falar_mercenario");

actionResult = processAction(runnerJack, optionFalarJack, catalog, world);
runnerJack = actionResult.nextState;
console.log(`-> Escolheu: "${optionFalarJack.text}"`);
console.log(`   Nova cena: ${runnerJack.currentSceneId} (Esperado: cena_mercenario_conversa)`);

const sceneMercenario = world.scenes.find(s => s.id === runnerJack.currentSceneId);
const optionSubornarJack = sceneMercenario.options.find(o => o.id === "subornar_jack");

console.log(`   Inventário antes do suborno: ${runnerJack.inventory.join(', ')}`);
actionResult = processAction(runnerJack, optionSubornarJack, catalog, world);
runnerJack = actionResult.nextState;
console.log(`-> Escolheu: "${optionSubornarJack.text}"`);
console.log(`   Nova cena: ${runnerJack.currentSceneId} (Esperado: cena_mercenario_sucesso)`);
console.log(`   Inventário após o suborno (deve remover chip_cripto): ${runnerJack.inventory.join(', ')}`);

const sceneMercenarioSucesso = world.scenes.find(s => s.id === runnerJack.currentSceneId);
const optionIrReservadoJack = sceneMercenarioSucesso.options.find(o => o.id === "ir_reservado_jack");

actionResult = processAction(runnerJack, optionIrReservadoJack, catalog, world);
runnerJack = actionResult.nextState;
console.log(`-> Escolheu: "${optionIrReservadoJack.text}"`);
console.log(`   Nova cena: ${runnerJack.currentSceneId} (Esperado: cena_beco)`);
console.log(`   Inventário final (deve conter passaporte_falso): ${runnerJack.inventory.join(', ')}`);

if (runnerJack.currentSceneId === "cena_beco" && runnerJack.inventory.includes("passaporte_falso") && !runnerJack.inventory.includes("chip_cripto")) {
  console.log("✓ Negociação e suborno com Jack-Knife validados com sucesso.");
} else {
  console.error("✗ Falha na validação da negociação com Jack-Knife.");
  process.exit(1);
}

// 11. Testar Sistema de Morte por HP Zerado (Fail Forward progressivo até a morte)
console.log("\n--- TESTE 10: Fail Forward progressivo até Morte (HP <= 0) ---");
let runnerSuicida = initializeGame({ name: "Alt", classId: "netrunner" }, catalog); // Max HP: 40
const optionIgnorarSair = sceneInicioNova.options.find(o => o.id === "ignorar_e_sair");

actionResult = processAction(runnerSuicida, optionIgnorarSair, catalog, world);
runnerSuicida = actionResult.nextState;
console.log(`-> Escolheu: "${optionIgnorarSair.text}"`);
console.log(`   Nova cena: ${runnerSuicida.currentSceneId} (Esperado: cena_rua_frente)`);
console.log(`   HP atual: ${runnerSuicida.player.hp}/${runnerSuicida.player.maxHp} (Esperado: 30/40)`);

const sceneRuaFrente = world.scenes.find(s => s.id === runnerSuicida.currentSceneId);
const optionCorrerRua = sceneRuaFrente.options.find(o => o.id === "correr_rua");

// Força falha crítica (D20 = 1). Leva para cena_rua_falha.
actionResult = processAction(runnerSuicida, optionCorrerRua, catalog, world, 1);
runnerSuicida = actionResult.nextState;
console.log(`-> Escolheu: "${optionCorrerRua.text}" (Falha Crítica)`);
console.log(`   Nova cena: ${runnerSuicida.currentSceneId} (Esperado: cena_rua_falha)`);

const sceneRuaFalha = world.scenes.find(s => s.id === runnerSuicida.currentSceneId);
const optionSerEspancado = sceneRuaFalha.options.find(o => o.id === "ser_espancado");

// Ao escolher 'ser_espancado', perde 100 HP. O HP vai para <= 0.
// A engine deve forçar automaticamente a transição para cena_game_over.
actionResult = processAction(runnerSuicida, optionSerEspancado, catalog, world);
runnerSuicida = actionResult.nextState;
console.log(`-> Escolheu: "${optionSerEspancado.text}"`);
console.log(`   Nova cena após Game Over automático: ${runnerSuicida.currentSceneId} (Esperado: cena_game_over)`);
console.log(`   HP final: ${runnerSuicida.player.hp}/${runnerSuicida.player.maxHp} (Esperado: 0/40)`);

if (runnerSuicida.currentSceneId === "cena_game_over" && runnerSuicida.player.hp === 0) {
  console.log("✓ Sistema de morte progressiva por HP zerado validado com sucesso.");
} else {
  console.error("✗ Falha ao validar sistema de morte progressiva.");
  process.exit(1);
}

// 12. Testar Novos Recursos (flagsRequired, flagsForbidden, setCounters, resetPlayerStatus)
console.log("\n--- TESTE 11: Validação de Contadores, Flags Estendidas e Reset de Status ---");
let testState = initializeGame({ name: "Tester", classId: "solo" }, catalog);

// Adiciona flags de teste
testState.flags["flag_teste_ativa"] = true;

// Define opção simulada com requisitos de flags
const optionWithFlagRequirements = {
  id: "opcao_flag_teste",
  text: "Opção para testar requisitos de flags",
  targetScene: "cena_beco",
  requirements: {
    flagsRequired: ["flag_teste_ativa"],
    flagsForbidden: ["flag_teste_proibida"]
  }
};

// Deve passar sem erro
try {
  let res = processAction(testState, optionWithFlagRequirements, catalog, world);
  console.log("✓ Requisitos de flags válidas passaram corretamente.");
} catch (err) {
  console.error("✗ Falha: Lançou erro ao checar flags válidas:", err.message);
  process.exit(1);
}

// Agora adiciona a flag proibida e deve lançar erro
testState.flags["flag_teste_proibida"] = true;
try {
  processAction(testState, optionWithFlagRequirements, catalog, world);
  console.error("✗ ERRO: Permitiu ação com flag proibida ativa!");
  process.exit(1);
} catch (err) {
  console.log(`✓ Sucesso! Bloqueou a ação com flag proibida lançando o erro: "${err.message}"`);
}

// Remove a flag requerida e deve lançar erro
testState.flags = { "flag_teste_proibida": false }; // Limpa as corretas
try {
  processAction(testState, optionWithFlagRequirements, catalog, world);
  console.error("✗ ERRO: Permitiu ação sem flag requerida!");
  process.exit(1);
} catch (err) {
  console.log(`✓ Sucesso! Bloqueou a ação sem flag requerida lançando o erro: "${err.message}"`);
}

// Testa os contadores (setCounters)
const optionWithCounters = {
  id: "opcao_contadores",
  text: "Opção com efeito de contadores",
  targetScene: "cena_beco",
  effects: {
    setCounters: {
      "reputacao": "+2",
      "creditos": "150"
    }
  }
};

let counterState = initializeGame({ name: "Tester", classId: "solo" }, catalog);
let counterRes = processAction(counterState, optionWithCounters, catalog, world);
counterState = counterRes.nextState;

console.log(`✓ Reputação após inicialização e efeito: ${counterState.counters["reputacao"]} (Esperado: 2)`);
console.log(`✓ Créditos após atribuição direta: ${counterState.counters["creditos"]} (Esperado: 150)`);

if (counterState.counters["reputacao"] !== 2 || counterState.counters["creditos"] !== 150) {
  console.error("✗ Falha: Operações em contadores falharam!");
  process.exit(1);
}

// Acumula mais na reputação
const optionWithCountersAdd = {
  id: "opcao_contadores_add",
  text: "Opção com mais reputação",
  targetScene: "cena_beco",
  effects: {
    setCounters: {
      "reputacao": "-3"
    }
  }
};
counterRes = processAction(counterState, optionWithCountersAdd, catalog, world);
counterState = counterRes.nextState;
console.log(`✓ Reputação após subtração: ${counterState.counters["reputacao"]} (Esperado: -1)`);
if (counterState.counters["reputacao"] !== -1) {
  console.error("✗ Falha: Subtração no contador falhou!");
  process.exit(1);
}

// Testa o resetPlayerStatus
const optionWithReset = {
  id: "opcao_reset",
  text: "Opção de reinício",
  targetScene: "cena_inicio",
  effects: {
    resetPlayerStatus: true
  }
};

// Modifica HP e itens de counterState para testar o reset
counterState.player.hp = 10;
counterState.inventory = ["item_estranho"];
counterState.flags = { "alguma_flag": true };

let resetRes = processAction(counterState, optionWithReset, catalog, world);
let resetState = resetRes.nextState;

console.log(`✓ HP após reset: ${resetState.player.hp}/${resetState.player.maxHp}`);
console.log(`✓ Inventário após reset: ${resetState.inventory.join(', ')}`);
console.log(`✓ Nova cena após reset (isStartScene): ${resetState.currentSceneId}`);

if (resetState.player.hp !== resetState.player.maxHp || resetState.inventory.includes("item_estranho") || Object.keys(resetState.flags).length !== 0) {
  console.error("✗ Falha: resetPlayerStatus não redefinido corretamente!");
  process.exit(1);
}
console.log("✓ resetPlayerStatus data-driven validado com sucesso.");

// 13. Testar Requisitos de Contadores (counters em requirements)
console.log("\n--- TESTE 12: Validação de Requisitos de Contadores ---");
let stateCounterReq = initializeGame({ name: "Tester", classId: "solo" }, catalog);

// Inicializa o contador de teste
stateCounterReq.counters["nivel_alerta"] = 2;

const optionWithCounterLT = {
  id: "opcao_counter_lt",
  text: "Opção que exige nivel_alerta < 4",
  targetScene: "cena_esconderijo",
  requirements: {
    counters: {
      "nivel_alerta": { "lt": 4 }
    }
  }
};

const optionWithCounterGTE = {
  id: "opcao_counter_gte",
  text: "Opção que exige nivel_alerta >= 4",
  targetScene: "cena_esconderijo_comprometido",
  requirements: {
    counters: {
      "nivel_alerta": { "gte": 4 }
    }
  }
};

// Deve passar na de menor que 4, mas falhar na de maior ou igual a 4
try {
  processAction(stateCounterReq, optionWithCounterLT, catalog, world);
  console.log("✓ Passou na opção permitida (nivel_alerta = 2 < 4).");
} catch (err) {
  console.error("✗ Falha: Rejeitou incorretamente opção de contador válida:", err.message);
  process.exit(1);
}

try {
  processAction(stateCounterReq, optionWithCounterGTE, catalog, world);
  console.error("✗ ERRO: Permitiu ação de contador inválida (nivel_alerta = 2 >= 4)!");
  process.exit(1);
} catch (err) {
  console.log(`✓ Sucesso! Bloqueou a ação inválida lançando o erro: "${err.message}"`);
}

// Altera o contador para 5 e testa novamente (deve inverter)
stateCounterReq.counters["nivel_alerta"] = 5;

try {
  processAction(stateCounterReq, optionWithCounterGTE, catalog, world);
  console.log("✓ Passou na opção permitida (nivel_alerta = 5 >= 4).");
} catch (err) {
  console.error("✗ Falha: Rejeitou incorretamente opção de contador válida após alteração:", err.message);
  process.exit(1);
}

try {
  processAction(stateCounterReq, optionWithCounterLT, catalog, world);
  console.error("✗ ERRO: Permitiu ação de contador inválida (nivel_alerta = 5 < 4)!");
  process.exit(1);
} catch (err) {
  console.log(`✓ Sucesso! Bloqueou a ação inválida após alteração lançando o erro: "${err.message}"`);
}

// 14. Testar checkRequirements exportada diretamente
console.log("\n--- TESTE 13: Validação Direta de checkRequirements ---");
const checkOption = {
  requirements: {
    classId: "solo",
    itemId: "pistola_pesada"
  }
};
const validState = {
  player: { classId: "solo" },
  inventory: ["pistola_pesada"]
};
const invalidState = {
  player: { classId: "netrunner" },
  inventory: []
};

const resValid = checkRequirements(checkOption, validState);
const resInvalid = checkRequirements(checkOption, invalidState);

console.log(`✓ checkRequirements estado válido: met=${resValid.met}, reason=${resValid.reason}`);
console.log(`✓ checkRequirements estado inválido: met=${resInvalid.met}, reason=${resInvalid.reason}`);

if (!resValid.met || resInvalid.met) {
  console.error("✗ Falha: Validação direta de checkRequirements falhou!");
  process.exit(1);
}

// 15. Testar Unicidade de Itens (Sem duplicatas no inventário)
console.log("\n--- TESTE 14: Unicidade de Itens no Inventário (Não-stackable) ---");
const optionGainDuplicate = {
  id: "opcao_ganhar_duplicado",
  text: "Ganhar item duplicado",
  targetScene: "cena_beco",
  effects: {
    gainItems: ["pistola_pesada"]
  }
};
let dupState = initializeGame({ name: "Tester", classId: "solo" }, catalog); // já começa com pistola_pesada
let dupRes = processAction(dupState, optionGainDuplicate, catalog, world);
dupState = dupRes.nextState;

console.log(`✓ Inventário após tentar ganhar item duplicado: ${dupState.inventory.join(', ')}`);
console.log(`✓ Mensagens de efeitos aplicados: ${dupRes.transitionMeta.effectsApplied.join(' | ')}`);

const duplicates = dupState.inventory.filter(item => item === "pistola_pesada");
if (duplicates.length > 1) {
  console.error("✗ Falha: Item duplicado foi adicionado ao inventário!");
  process.exit(1);
}
if (!dupRes.transitionMeta.effectsApplied.some(e => e.includes("Tentativa de ganhar item já presente no inventário"))) {
  console.error("✗ Falha: Mensagem de item duplicado ignorado não foi gerada!");
  process.exit(1);
}

// 16. Testar Custos de Créditos (Fase 2)
console.log("\n--- TESTE 15: Validação e Consumo de Custos de Créditos ---");
const optionWithCost = {
  id: "opcao_com_custo",
  text: "Ação que custa créditos",
  targetScene: "cena_beco",
  cost: {
    credits: 50
  }
};

let costState = initializeGame({ name: "Tester", classId: "solo" }, catalog);
costState.counters["credits"] = 100;

// Deve passar e descontar
let costResult = processAction(costState, optionWithCost, catalog, world);
costState = costResult.nextState;
console.log(`✓ Créditos restantes após gastar 50 (Tinha 100): ${costState.counters["credits"]}`);
console.log(`✓ Mensagem de efeito de custo: ${costResult.transitionMeta.effectsApplied.join(' | ')}`);

if (costState.counters["credits"] !== 50) {
  console.error("✗ Falha: Desconto de créditos incorreto!");
  process.exit(1);
}

// Deve falhar pois só restam 50 e custa 100
const optionWithHighCost = {
  id: "opcao_com_alto_custo",
  text: "Ação que custa muitos créditos",
  targetScene: "cena_beco",
  cost: {
    credits: 100
  }
};

try {
  processAction(costState, optionWithHighCost, catalog, world);
  console.error("✗ ERRO: Permitiu ação sem créditos suficientes!");
  process.exit(1);
} catch (err) {
  console.log(`✓ Sucesso! Bloqueou ação com créditos insuficientes lançando erro: "${err.message}"`);
}

console.log("\n=== TODOS OS TESTES DA ENGINE E DO NOVO GRAFO PASSARAM COM SUCESSO! ===");

