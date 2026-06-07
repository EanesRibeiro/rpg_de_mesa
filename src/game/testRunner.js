import fs from 'fs';
import { initializeGame, processAction } from './engine.js';
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

let result = processAction(state, option1);
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
result = processAction(state, optionDesarmar, 15);
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
result = processAction(state, option1);
state = result.nextState;

// Força D20 = 5. Total: 5 - 1 = 4. DC 12. Falha esperada!
result = processAction(state, optionDesarmar, 5);
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
result = processAction(netrunnerState, optionIrReservado);
netrunnerState = result.nextState;

// Na cena beco, escolhe "hackear_cyberdeck" (exige netrunner + cyberdeck_basico)
const optionHack = sceneBeco.options.find(o => o.id === "hackear_cyberdeck");

// Deve processar com sucesso
result = processAction(netrunnerState, optionHack);
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
soloNoBeco = processAction(soloNoBeco, optionIrReservado).nextState;

try {
  // Solo tenta usar o hack (bloqueado para classe netrunner)
  processAction(soloNoBeco, optionHack);
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

let actionResult = processAction(runnerBalcao, optionIrBalcao);
runnerBalcao = actionResult.nextState;
console.log(`-> Escolheu: "${optionIrBalcao.text}"`);
console.log(`   Nova cena: ${runnerBalcao.currentSceneId} (Esperado: cena_balcao_investigar)`);

const sceneBalcao = world.scenes.find(s => s.id === runnerBalcao.currentSceneId);
const optionHackBalcao = sceneBalcao.options.find(o => o.id === "hackear_balcao");

// Força D20 = 18. Interface (INT: 10) -> mod 0. Total 18 vs DC 12. Sucesso!
actionResult = processAction(runnerBalcao, optionHackBalcao, 18);
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

actionResult = processAction(runnerJack, optionFalarJack);
runnerJack = actionResult.nextState;
console.log(`-> Escolheu: "${optionFalarJack.text}"`);
console.log(`   Nova cena: ${runnerJack.currentSceneId} (Esperado: cena_mercenario_conversa)`);

const sceneMercenario = world.scenes.find(s => s.id === runnerJack.currentSceneId);
const optionSubornarJack = sceneMercenario.options.find(o => o.id === "subornar_jack");

console.log(`   Inventário antes do suborno: ${runnerJack.inventory.join(', ')}`);
actionResult = processAction(runnerJack, optionSubornarJack);
runnerJack = actionResult.nextState;
console.log(`-> Escolheu: "${optionSubornarJack.text}"`);
console.log(`   Nova cena: ${runnerJack.currentSceneId} (Esperado: cena_mercenario_sucesso)`);
console.log(`   Inventário após o suborno (deve remover chip_cripto): ${runnerJack.inventory.join(', ')}`);

const sceneMercenarioSucesso = world.scenes.find(s => s.id === runnerJack.currentSceneId);
const optionIrReservadoJack = sceneMercenarioSucesso.options.find(o => o.id === "ir_reservado_jack");

actionResult = processAction(runnerJack, optionIrReservadoJack);
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

actionResult = processAction(runnerSuicida, optionIgnorarSair);
runnerSuicida = actionResult.nextState;
console.log(`-> Escolheu: "${optionIgnorarSair.text}"`);
console.log(`   Nova cena: ${runnerSuicida.currentSceneId} (Esperado: cena_rua_frente)`);
console.log(`   HP atual: ${runnerSuicida.player.hp}/${runnerSuicida.player.maxHp} (Esperado: 30/40)`);

const sceneRuaFrente = world.scenes.find(s => s.id === runnerSuicida.currentSceneId);
const optionCorrerRua = sceneRuaFrente.options.find(o => o.id === "correr_rua");

// Força falha crítica (D20 = 1). Leva para cena_rua_falha.
actionResult = processAction(runnerSuicida, optionCorrerRua, 1);
runnerSuicida = actionResult.nextState;
console.log(`-> Escolheu: "${optionCorrerRua.text}" (Falha Crítica)`);
console.log(`   Nova cena: ${runnerSuicida.currentSceneId} (Esperado: cena_rua_falha)`);

const sceneRuaFalha = world.scenes.find(s => s.id === runnerSuicida.currentSceneId);
const optionSerEspancado = sceneRuaFalha.options.find(o => o.id === "ser_espancado");

// Ao escolher 'ser_espancado', perde 100 HP. O HP vai para <= 0.
// A engine deve forçar automaticamente a transição para cena_game_over.
actionResult = processAction(runnerSuicida, optionSerEspancado);
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

console.log("\n=== TODOS OS TESTES DA ENGINE E DO NOVO GRAFO PASSARAM COM SUCESSO! ===");

