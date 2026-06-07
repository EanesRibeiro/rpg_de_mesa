import React, { useState, useEffect, useReducer, useCallback } from 'react';
import CharacterCreation from './components/CharacterCreation';
import SceneDisplay from './components/SceneDisplay';
import OptionsList from './components/OptionsList';
import DiceRoller from './components/DiceRoller';
import HUD from './components/HUD';
import { initializeGame, processAction } from './game/engine';
import { validateGraph } from './game/validator';

// Reducer para o estado do jogo
function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      const { characterConfig, catalog, startSceneId, extraItems } = action.payload;
      return {
        gameState: initializeGame(characterConfig, catalog, { startSceneId, extraItems }),
        lastTransition: null
      };
    case 'LOAD_GAME':
      return {
        gameState: action.payload.savedState,
        lastTransition: null
      };
    case 'EXECUTE_ACTION':
      const { option, diceRoll, catalog: execCatalog, world: execWorld } = action.payload;
      let { nextState, transitionMeta } = processAction(state.gameState, option, execCatalog, execWorld, diceRoll);

      return {
        gameState: nextState,
        lastTransition: transitionMeta
      };
    case 'RESET_GAME':
      return null;
    default:
      return state;
  }
}

export default function App() {
  const [catalog, setCatalog] = useState(null);
  const [world, setWorld] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // O estado global do jogo (inicia nulo, mostrando tela de criação de personagem)
  const [state, dispatch] = useReducer(gameReducer, null);

  // Estado para controlar a rolagem de dados
  const [activeCheckOption, setActiveCheckOption] = useState(null);

  // Controle do ciclo de vida da transição e tremor de HP/Sanidade
  const [transitionPhase, setTransitionPhase] = useState('idle'); // 'fade-out' | 'fade-in' | 'typing' | 'idle'
  const [impactShake, setImpactShake] = useState(false);
  const [hpDamaged, setHpDamaged] = useState(false);
  const [sanityDamaged, setSanityDamaged] = useState(false);

  // Callback estável para evitar loops de renderização no SceneDisplay
  const handleTypingComplete = useCallback(() => {
    setTransitionPhase('idle');
  }, []);

  // 1. Carrega o catálogo e grafo de cenas na inicialização do app
  useEffect(() => {
    Promise.all([
      fetch('/data/catalog.json').then(res => res.json()),
      fetch('/data/world.json').then(res => res.json())
    ])
      .then(([catalogData, worldData]) => {
        setCatalog(catalogData);
        setWorld(worldData);
        
        // Roda a validação estrutural do grafo
        const errors = validateGraph(worldData);
        if (errors.length > 0) {
          setValidationErrors(errors);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar dados do jogo:", err);
        setLoading(false);
      });
  }, []);

  // 2. Carrega jogo salvo do localStorage com validação robusta para evitar crashes
  useEffect(() => {
    if (catalog && world) {
      const saved = localStorage.getItem('cyberpunk_rpg_save');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.currentSceneId && parsed.player && parsed.inventory) {
            dispatch({ type: 'LOAD_GAME', payload: { savedState: parsed } });
          } else {
            // Se o save estiver corrompido, incompleto ou de versão antiga, removemos para evitar travar a interface
            console.warn("Save corrompido ou incompleto detectado. Removendo save para evitar crash.");
            localStorage.removeItem('cyberpunk_rpg_save');
          }
        } catch (e) {
          console.error("Erro ao carregar save:", e);
          localStorage.removeItem('cyberpunk_rpg_save');
        }
      }
    }
  }, [catalog, world]);

  // 3. Salva automaticamente o progresso sempre que o estado mudar
  useEffect(() => {
    if (state && state.gameState) {
      localStorage.setItem('cyberpunk_rpg_save', JSON.stringify(state.gameState));
    } else if (state === null) {
      localStorage.removeItem('cyberpunk_rpg_save');
    }
  }, [state]);

  // 4. Efeito para atualizar as paletas de cores dinâmicas (theme) e tons (tone) do Design System
  useEffect(() => {
    if (state && state.gameState && world) {
      const currentScene = world.scenes.find(s => s.id === state.gameState.currentSceneId);
      if (currentScene && currentScene.visualLayers) {
        const { theme, tone } = currentScene.visualLayers;
        
        // Aplica os atributos no elemento HTML
        document.documentElement.setAttribute('data-palette', theme || 'synaptic');
        document.documentElement.setAttribute('data-tone', tone || 'cryptic');
      }
    } else {
      // Padrão na tela de criação de personagem
      document.documentElement.setAttribute('data-palette', 'synaptic');
      document.documentElement.setAttribute('data-tone', 'cryptic');
    }
  }, [state?.gameState?.currentSceneId, world]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cyberBg flex items-center justify-center font-mono text-xs text-cyberGreenLight animate-pulse">
        CARREGANDO INTERFACE NEURAL... //
      </div>
    );
  }

  // Previne crash se o carregamento falhou e as variáveis estão nulas
  if (!catalog || !world) {
    return (
      <div className="min-h-screen bg-cyberBg grid-bg flex items-center justify-center p-6 text-center">
        <div className="glass code-border border-rose-500/30 max-w-xl w-full p-8 rounded-xl bg-rose-950/10">
          <span className="font-mono text-xs text-rose-400 uppercase tracking-widest font-semibold block mb-2">
            [ERRO DE INICIALIZAÇÃO NEURAL]
          </span>
          <h2 className="hl text-xl text-white mb-4">Falha ao carregar os dados de configuração do jogo</h2>
          <p className="text-sm text-t2 font-sans mb-6">Não foi possível carregar os arquivos catalog.json ou world.json.</p>
          <button 
            type="button" 
            className="btn-primary py-2.5 px-6 rounded font-mono text-xs uppercase tracking-wider" 
            onClick={() => window.location.reload()}
          >
            Tentar Reconectar
          </button>
        </div>
      </div>
    );
  }

  // Se houver erros graves no grafo, bloqueia a execução em desenvolvimento
  if (validationErrors.length > 0) {
    return (
      <div className="min-h-screen bg-cyberBg grid-bg flex items-center justify-center p-6">
        <div className="glass code-border border-rose-500/30 max-w-xl w-full p-8 rounded-xl bg-rose-950/10">
          <span className="font-mono text-xs text-rose-400 uppercase tracking-widest font-semibold block mb-2">
            [ERRO DE COMPILAÇÃO DO GRAFO]
          </span>
          <h2 className="hl text-xl text-white mb-4">Erros detectados no world.json</h2>
          <ul className="space-y-2 font-mono text-xs text-rose-300">
            {validationErrors.map((err, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-rose-500 font-bold">✗</span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[10px] text-t3 font-sans">
            Corrija o arquivo `world.json` para prosseguir com a execução do jogo.
          </p>
        </div>
      </div>
    );
  }

  // 5. Exibe a tela de criação de personagem se não houver jogo ativo
  if (!state) {
    return (
      <CharacterCreation 
        catalog={catalog} 
        onInitialize={(characterConfig) => {
          // Sorteia uma das cenas marcadas como cena de início (isStartScene)
          const startScenes = world.scenes.filter(s => s.isStartScene);
          const chosenScene = startScenes.length > 0
            ? startScenes[Math.floor(Math.random() * startScenes.length)]
            : null;
          const startSceneId = chosenScene ? chosenScene.id : "cena_inicio";

          // Sorteia um item extra útil inicial
          const possibleItems = ["estimulante_combate", "chip_cripto", "fuzivel_reserva"];
          const extraItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];

          dispatch({ 
            type: 'START_GAME', 
            payload: { 
              characterConfig, 
              catalog, 
              startSceneId, 
              extraItems: [extraItem] 
            } 
          });
          setTransitionPhase('typing');
        }}
      />
    );
  }

  const currentScene = world.scenes.find(s => s.id === state.gameState.currentSceneId);

  // Se a cena atual for inexistente (deveria ter sido capturado pelo validador), previne crash
  if (!currentScene) {
    return (
      <div className="min-h-screen bg-cyberBg flex flex-col items-center justify-center p-6 text-center">
        <h2 className="hl text-xl text-white mb-4">Cena Órfã Encontrada</h2>
        <p className="text-sm text-t2 font-sans mb-6">O ID da cena '{state.gameState.currentSceneId}' não pôde ser localizado.</p>
        <button type="button" className="btn-primary py-2 px-6 rounded" onClick={() => dispatch({ type: 'RESET_GAME' })}>
          Reiniciar Conexão
        </button>
      </div>
    );
  }

  // Trata a seleção de opção linear
  const handleSelectOption = (option) => {
    executeTransition(option, null);
  };

  // Trata a abertura do roller para opções de Check
  const handleSelectOptionWithCheck = (option) => {
    setActiveCheckOption(option);
  };

  // Trata a conclusão do teste D20
  const handleDiceRollComplete = (rollValue) => {
    const option = activeCheckOption;
    setActiveCheckOption(null);
    executeTransition(option, rollValue);
  };

  // Executa transições com controle de fases sincronizado e detecção de dano
  const executeTransition = (option, rollValue) => {
    const impact = currentScene.visualLayers.impact || 'low';
    
    const delayMap = {
      low: 200,
      medium: 500,
      high: 900,
      critical: 1400
    };
    const damageDuration = delayMap[impact] || 200;

    // Se o rolo de dados foi uma falha crítica ou o impacto for crítico, treme a tela
    if (rollValue === 1 || impact === 'critical') {
      setImpactShake(true);
      setTimeout(() => setImpactShake(false), 600);
    }

    // Fase 1: fade-out (400ms)
    setTransitionPhase('fade-out');

    setTimeout(() => {
      // Coleta status antigos
      const prevHp = state.gameState.player.hp;
      const prevSanity = state.gameState.player.sanity;

      // Executa o dispatch
      dispatch({ 
        type: 'EXECUTE_ACTION', 
        payload: { option, diceRoll: rollValue, catalog, world } 
      });

      // Detecção de dano imediata
      try {
        const { nextState: predictedState } = processAction(state.gameState, option, catalog, world, rollValue);
        if (predictedState.player.hp < prevHp) {
          setHpDamaged(true);
          setTimeout(() => setHpDamaged(false), damageDuration);
        }
        if (predictedState.player.sanity < prevSanity) {
          setSanityDamaged(true);
          setTimeout(() => setSanityDamaged(false), damageDuration);
        }
      } catch (err) {
        console.error("Erro ao prever efeitos da ação para o HUD:", err);
      }

      // Fase 2: fade-in (600ms)
      setTransitionPhase('fade-in');

      setTimeout(() => {
        // Fase 3: typing (digitação narrativa)
        setTransitionPhase('typing');
      }, 600);

    }, 400);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between bg-cyberBg grid-bg transition-all duration-300 ${impactShake ? 'animate-shake' : ''}`}>
      {/* Neural Orb de fundo para o neon visual */}
      <div className="neural-orb"></div>

      {/* Cabeçalho de Navegação com opções de Reiniciar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 py-4 flex justify-between items-center border-b border-t3/10 bg-cyberBg/40 backdrop-blur-md">
        <div className="font-display font-bold text-sm tracking-widest text-cyberGreenLight uppercase">
          CHIBA_GRID // V0.1
        </div>
        <button 
          type="button" 
          className="font-mono text-[9px] uppercase px-3 py-1.5 rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 transition-colors"
          onClick={() => {
            if (window.confirm("Deseja realmente apagar seu progresso e reiniciar?")) {
              dispatch({ type: 'RESET_GAME' });
            }
          }}
        >
          Desconectar Agente
        </button>
      </header>

      {/* Conteúdo Central da Narrativa */}
      <main 
        className="flex-1 flex flex-col justify-center px-4 py-8 md:py-12"
        style={{
          opacity: transitionPhase === 'fade-out' ? 0 : 1,
          transition: transitionPhase === 'fade-out' 
            ? 'opacity 400ms ease-out' 
            : transitionPhase === 'fade-in' 
              ? 'opacity 600ms ease-in' 
              : 'none'
        }}
      >
        <SceneDisplay 
          scene={currentScene} 
          onTypingComplete={handleTypingComplete} 
        />
        
        <OptionsList 
          options={currentScene.options} 
          playerState={state.gameState.player}
          inventory={state.gameState.inventory}
          flags={state.gameState.flags}
          counters={state.gameState.counters}
          transitionPhase={transitionPhase}
          onSelectOption={handleSelectOption}
          onSelectOptionWithCheck={handleSelectOptionWithCheck}
        />
      </main>

      {/* Barra de HUD fixa no rodapé */}
      <HUD 
        player={state.gameState.player} 
        inventory={state.gameState.inventory} 
        catalogItems={catalog.items} 
        hpDamaged={hpDamaged}
        sanityDamaged={sanityDamaged}
      />

      {/* Modal de Rolagem D20 (Check) */}
      {activeCheckOption && (
        <DiceRoller 
          option={activeCheckOption} 
          playerState={state.gameState.player} 
          onComplete={handleDiceRollComplete}
        />
      )}
    </div>
  );
}
