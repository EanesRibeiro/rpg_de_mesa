import React, { useState } from 'react';
import { getAttributeModifier } from '../game/engine';

export default function CharacterCreation({ catalog, onInitialize }) {
  const [name, setName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState(catalog.classes[0].id);
  
  // Atributos começam zerados até que o jogador role os dados
  const [attributes, setAttributes] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  // Monitor biométrico dinâmico
  const [displayAttributes, setDisplayAttributes] = useState(() => {
    const initial = {};
    catalog.attributes.forEach(attr => {
      initial[attr.id] = { value: '--', isCalibrated: false };
    });
    return initial;
  });

  const selectedClass = catalog.classes.find(c => c.id === selectedClassId);

  // Rolagem de dados: 4d6 descarta o menor para cada um dos 5 atributos
  const rollAttribute = () => {
    const rolls = [];
    for (let i = 0; i < 4; i++) {
      rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    rolls.sort((a, b) => a - b);
    rolls.shift(); // Remove o menor
    return rolls.reduce((sum, val) => sum + val, 0);
  };

  const handleRollAttributes = () => {
    setIsRolling(true);
    setAttributes(null); // Oculta botões finais para reiniciar o fluxo
    
    // Reseta estado de calibragem para o início da varredura
    setDisplayAttributes(() => {
      const initial = {};
      catalog.attributes.forEach(attr => {
        initial[attr.id] = { value: '--', isCalibrated: false };
      });
      return initial;
    });

    let ticks = 0;
    const totalTicks = 30; // 30 ticks * 50ms = 1500ms (1.5 segundos)

    const interval = setInterval(() => {
      setDisplayAttributes(prev => {
        const updated = { ...prev };
        catalog.attributes.forEach(attr => {
          if (!updated[attr.id].isCalibrated) {
            updated[attr.id] = {
              value: String(Math.floor(Math.random() * 16) + 3).padStart(2, '0'),
              isCalibrated: false
            };
          }
        });
        return updated;
      });
      ticks++;

      if (ticks >= totalTicks) {
        clearInterval(interval);

        // Atributos reais
        const finalAttrs = {
          PHY: rollAttribute(),
          REF: rollAttribute(),
          INT: rollAttribute(),
          TEC: rollAttribute(),
          WIL: rollAttribute()
        };

        // Bônus de classe
        if (selectedClassId === 'solo') finalAttrs.REF += 2;
        if (selectedClassId === 'netrunner') finalAttrs.INT += 2;
        if (selectedClassId === 'techie') finalAttrs.TEC += 2;

        // Efeito cascata sequencial de cima para baixo
        catalog.attributes.forEach((attr, index) => {
          setTimeout(() => {
            setDisplayAttributes(prev => ({
              ...prev,
              [attr.id]: {
                value: finalAttrs[attr.id],
                isCalibrated: true
              }
            }));

            // Finaliza rolagem global ao calibrar o último
            if (index === catalog.attributes.length - 1) {
              setAttributes(finalAttrs);
              setIsRolling(false);
            }
          }, index * 150); // Atraso de 150ms por linha
        });
      }
    }, 50);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!attributes) return;

    onInitialize({
      name: name.trim(),
      classId: selectedClassId,
      attributes: attributes
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyberBg grid-bg p-4 md:p-8">
      {/* Orbes orbitais decorativas */}
      <div className="neural-orb"></div>
      
      <div className="glass code-border w-full max-w-4xl p-6 md:p-10 rounded-2xl relative z-10">
        <div className="text-center mb-8">
          <span className="badge-live mb-3">Protocolo de Onboarding Ativo</span>
          <h1 className="hl text-3xl md:text-5xl text-white uppercase tracking-tight">Criar Personagem</h1>
          <p className="text-sm text-t2 font-sans mt-2">Gere sua identidade digital para navegar pela grade de Chiba City.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* PARTE 3: Campo NOME DO AGENTE - Reposicionado no topo e Isolado */}
          <div className="border-b border-cyberGreen/10 pb-6 mb-4">
            <label className="font-mono text-xs uppercase text-t3 tracking-wider block mb-2.5 flex items-center gap-1.5">
              <span>NOME DO AGENTE (IDENTIDADE DE REDE)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyberGreenLight animate-pulse"></span>
            </label>
            <div className="relative flex items-center">
              <input 
                type="text" 
                required
                autoFocus
                placeholder="EX: V_NEO_RUNNER..." 
                className="w-full bg-cyberBg2/80 border border-cyberGreen/20 focus:border-cyberGreenLight/60 rounded-lg p-4 pr-12 text-sm md:text-base text-white outline-none font-mono placeholder-t3/30 transition-colors caret-cyberGreenLight"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              {/* Cursor piscante de bloco no canto direito do input */}
              <span className="absolute right-5 text-cyberGreenLight font-mono text-base animate-cursor-blink pointer-events-none">
                █
              </span>
            </div>
          </div>

          {/* Grid de Conteúdo Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lado Esquerdo: Seleção de Classe e Perfil */}
            <div className="space-y-6">
              <div>
                <label className="font-mono text-xs uppercase text-t3 tracking-wider block mb-3">
                  Seleção de Classe (Cartas de Arquétipo)
                </label>
                
                {/* PARTE 1.1: Cartas de Dossiê */}
                <div className="grid grid-cols-3 gap-3">
                  {catalog.classes.map(c => {
                    const isSelected = selectedClassId === c.id;
                    const opacityClass = selectedClassId 
                      ? (isSelected ? 'opacity-100' : 'opacity-40') 
                      : 'opacity-100';

                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`relative flex flex-col items-center justify-between p-4 rounded-xl border text-center font-mono cursor-pointer transition-all duration-300 min-h-[140px] group select-none
                          ${isSelected 
                            ? 'border-cyberGreenLight bg-cyberGreen/10 shadow-[0_0_20px_rgba(74,222,128,0.25)] text-cyberGreenLight' 
                            : 'border-cyberGreen/20 bg-cyberBg2/30 text-t2 hover:border-cyberGreen/60 hover:text-white hover:-translate-y-3 hover:shadow-[0_0_15px_rgba(74,222,128,0.15)]'
                          }
                          ${opacityClass}
                        `}
                        onClick={() => {
                          setSelectedClassId(c.id);
                          setAttributes(null); // Força nova rolagem ao trocar de classe
                          setDisplayAttributes(() => {
                            const initial = {};
                            catalog.attributes.forEach(attr => {
                              initial[attr.id] = { value: '--', isCalibrated: false };
                            });
                            return initial;
                          });
                        }}
                      >
                        {/* ID do Dossiê */}
                        <div className="absolute top-2 left-2 text-[8px] text-t3 uppercase tracking-wider font-bold">
                          DOSS-{c.id === 'solo' ? '01' : c.id === 'netrunner' ? '02' : '03'}
                        </div>
                        
                        {/* Ícone e Nome */}
                        <div className="my-auto py-2">
                          <div className="flex justify-center mb-1.5 filter drop-shadow-[0_0_6px_rgba(74,222,128,0.25)]">
                            {c.id === 'solo' && (
                              <div className="w-6 h-6 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
                                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                  className="w-6 h-6 text-current">
                                  <circle cx="12" cy="12" r="7"/>
                                  <circle cx="12" cy="12" r="2"/>
                                  <line x1="12" y1="2" x2="12" y2="5"/>
                                  <line x1="12" y1="19" x2="12" y2="22"/>
                                  <line x1="2" y1="12" x2="5" y2="12"/>
                                  <line x1="19" y1="12" x2="22" y2="12"/>
                                </svg>
                              </div>
                            )}
                            {c.id === 'netrunner' && (
                              <div className="w-6 h-6 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
                                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                  className="w-6 h-6 text-current">
                                  <rect x="9" y="9" width="6" height="6" rx="1"/>
                                  <line x1="12" y1="3" x2="12" y2="9"/>
                                  <line x1="12" y1="15" x2="12" y2="21"/>
                                  <line x1="3" y1="12" x2="9" y2="12"/>
                                  <line x1="15" y1="12" x2="21" y2="12"/>
                                  <circle cx="12" cy="3" r="1.5"/>
                                  <circle cx="12" cy="21" r="1.5"/>
                                  <circle cx="3" cy="12" r="1.5"/>
                                  <circle cx="21" cy="12" r="1.5"/>
                                </svg>
                              </div>
                            )}
                            {c.id === 'techie' && (
                              <div className="w-6 h-6 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
                                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                  className="w-6 h-6 text-current">
                                  <circle cx="12" cy="12" r="3"/>
                                  <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12
                                           M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold text-xs tracking-wider uppercase">
                            {c.name}
                          </h3>
                        </div>

                        {/* Status da Carta */}
                        <div className="text-[8px] text-t3 border-t border-cyberGreen/10 pt-1.5 w-full uppercase tracking-wider">
                          {isSelected ? '[ ATIVO ]' : '[ DECODIFICAR ]'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PARTE 1.2: Integração Dinâmica da Análise de Perfil */}
              {selectedClass && (
                <div 
                  key={selectedClass.id}
                  className="glass p-5 rounded-xl border border-cyberGreen/20 bg-cyberBg2/30 space-y-4 animate-fade-in-up"
                >
                  <div className="flex justify-between items-center border-b border-cyberGreen/10 pb-2">
                    <span className="font-mono text-xs text-cyberGreenLight uppercase tracking-wider block font-bold">
                      Análise de Perfil // {selectedClass.name}
                    </span>
                    <span className="font-mono text-[9px] text-t3 uppercase tracking-widest">STATUS: DECODIFICADO</span>
                  </div>
                  <p className="text-xs text-t2 leading-relaxed font-sans">{selectedClass.description}</p>
                  
                  <div className="pt-1 flex flex-col gap-2">
                    <span className="font-mono text-[9px] text-t3 uppercase tracking-wider block font-bold">
                      Equipamento Inicial Carregado na Memória:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedClass.startingItems.map(item => (
                        <span key={item} className="font-mono text-[9px] uppercase px-2 py-0.5 rounded border border-cyberGreen/20 bg-cyberGreen/5 text-cyberGreenLight shadow-[inset_0_0_4px_rgba(74,222,128,0.1)]">
                          {item.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lado Direito: Monitor de Diagnóstico Biométrico */}
            <div className="space-y-6 flex flex-col justify-between">
              <div>
                <label className="font-mono text-xs uppercase text-t3 tracking-wider block mb-3">
                  Parâmetros Biométricos (Diagnóstico de Rede)
                </label>

                {/* PARTE 2.1: Monitor Permanente */}
                <div className="space-y-3 font-mono">
                  {catalog.attributes.map(attr => {
                    const status = displayAttributes[attr.id] || { value: '--', isCalibrated: false };
                    const isCalibrated = status.isCalibrated;
                    const val = status.value;
                    const mod = isCalibrated ? getAttributeModifier(val) : null;
                    const modText = mod !== null ? (mod >= 0 ? `+${mod}` : mod) : '';
                    
                    // Mapeamento de progresso (máximo 20)
                    const percentage = isCalibrated ? (val / 20) * 100 : 0;

                    return (
                      <div 
                        key={attr.id} 
                        className={`p-3 rounded-xl border transition-all duration-300 flex flex-col gap-2.5
                          ${isCalibrated 
                            ? 'border-cyberGreen/20 bg-cyberBg2/50 shadow-[0_0_10px_rgba(34,197,94,0.05)]' 
                            : 'border-cyberGreen/5 bg-cyberBg2/10 opacity-70'
                          }
                        `}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white text-xs font-bold tracking-wider">{attr.name}</span>
                            <span className="text-t3 text-[8px] uppercase tracking-widest block">{attr.id}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Valor Biométrico */}
                            <span 
                              className={`text-base font-black transition-colors duration-300
                                ${isCalibrated 
                                  ? 'text-cyberGreenLight' 
                                  : (isRolling ? 'text-cyberGreenLight/60' : 'text-t3/40')
                                }
                              `}
                            >
                              {isCalibrated ? String(val).padStart(2, '0') : val}
                            </span>
                            
                            {/* Modificador */}
                            {isCalibrated && (
                              <span className="text-t2 text-[10px] font-bold bg-cyberGreen/10 px-1.5 py-0.5 rounded border border-cyberGreen/20">
                                ({modText})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Barra de Progresso Elástica */}
                        <div className="w-full h-1.5 bg-cyberBg rounded-full overflow-hidden border border-cyberGreen/10 relative">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 relative
                              ${isCalibrated 
                                ? 'bg-gradient-to-r from-cyberGreen to-cyberGreenLight shadow-[0_0_8px_rgba(74,222,128,0.5)]' 
                                : 'bg-cyberGreen/10'
                              }
                            `}
                            style={{ 
                              width: `${percentage}%`,
                              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' 
                            }}
                          >
                            {isCalibrated && (
                              <span className="absolute right-0 top-0 h-full w-2 bg-white/40 blur-[2px] rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botões de Ação com Pulsação Rápida */}
              <div className="space-y-3 pt-4">
                {!attributes ? (
                  <button
                    type="button"
                    disabled={isRolling}
                    className={`w-full py-4 px-6 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold text-center transition-all duration-300
                      ${isRolling 
                        ? 'bg-cyberGreen/5 border border-cyberGreen/20 text-cyberGreen/40 cursor-not-allowed animate-pulse-fast shadow-[0_0_15px_rgba(74,222,128,0.05)]' 
                        : 'btn-primary cursor-pointer'
                      }
                    `}
                    onClick={handleRollAttributes}
                  >
                    {isRolling ? '/// CALIBRANDO DIAGNÓSTICO...' : 'ROLAR ATRIBUTOS DO DISPOSITIVO'}
                  </button>
                ) : (
                  <div className="flex gap-3 animate-fade-in">
                    <button
                      type="button"
                      disabled={isRolling}
                      className="btn-ghost flex-1 py-4 px-4 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold text-center cursor-pointer"
                      onClick={handleRollAttributes}
                    >
                      Rolar Novamente
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex-[2] py-4 px-6 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold text-center cursor-pointer"
                    >
                      INICIAR CONEXÃO
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

