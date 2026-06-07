import React, { useState } from 'react';
import { getAttributeModifier } from '../game/engine';

export default function CharacterCreation({ catalog, onInitialize }) {
  const [name, setName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState(catalog.classes[0].id);
  
  // Atributos começam zerados até que o jogador role os dados
  const [attributes, setAttributes] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

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
    let counter = 0;
    
    const interval = setInterval(() => {
      // Gera atributos aleatórios temporários para dar sensação de rolagem
      setAttributes({
        PHY: Math.floor(Math.random() * 15) + 3,
        REF: Math.floor(Math.random() * 15) + 3,
        INT: Math.floor(Math.random() * 15) + 3,
        TEC: Math.floor(Math.random() * 15) + 3,
        WIL: Math.floor(Math.random() * 15) + 3
      });
      counter++;

      if (counter > 10) {
        clearInterval(interval);
        
        // Atributos rolam com base na classe: damos um bônus pequeno na especialidade da classe
        const newAttrs = {
          PHY: rollAttribute(),
          REF: rollAttribute(),
          INT: rollAttribute(),
          TEC: rollAttribute(),
          WIL: rollAttribute()
        };

        // Bônus temático da classe (ex: +2 no atributo principal da classe)
        if (selectedClassId === 'solo') newAttrs.REF += 2;
        if (selectedClassId === 'netrunner') newAttrs.INT += 2;
        if (selectedClassId === 'techie') newAttrs.TEC += 2;

        setAttributes(newAttrs);
        setIsRolling(false);
      }
    }, 80);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!attributes) return;

    // Configura e envia as especificações do personagem
    onInitialize({
      name: name.trim(),
      classId: selectedClassId,
      // Se rolou atributos customizados, podemos opcionalmente injetar no estado inicial
      // da engine. Vamos estender o initializeGame para aceitar atributos customizados!
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lado Esquerdo: Identidade e Classe */}
          <div className="space-y-6">
            <div>
              <label className="font-mono text-xs uppercase text-t3 tracking-wider block mb-2">Nome do Agente</label>
              <input 
                type="text" 
                required
                placeholder="EX: V_NEO_RUNNER" 
                className="w-full bg-cyberBg2/80 border border-cyberGreen/20 focus:border-cyberGreenLight/60 rounded-lg p-3 text-sm md:text-base text-white outline-none font-mono placeholder-t3/40 transition-colors"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="font-mono text-xs uppercase text-t3 tracking-wider block mb-2">Seleção de Classe</label>
              <div className="grid grid-cols-3 gap-2">
                {catalog.classes.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className={`py-2 px-3 rounded-lg border font-mono text-xs uppercase tracking-wider transition-all duration-300
                      ${selectedClassId === c.id 
                        ? 'border-cyberGreenLight bg-cyberGreen/20 text-cyberGreenLight' 
                        : 'border-t3/10 bg-cyberBg2/40 text-t2 hover:border-t3/40 hover:text-t1'
                      }
                    `}
                    onClick={() => {
                      setSelectedClassId(c.id);
                      setAttributes(null); // Reseta os atributos para forçar nova rolagem condicional à classe
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Descrição da Classe */}
            <div className="glass p-4 rounded-xl border border-t3/10 bg-cyberBg2/30">
              <span className="font-mono text-[10px] text-cyberGreenLight uppercase tracking-wider block mb-1">
                Análise de Perfil // {selectedClass.name}
              </span>
              <p className="text-xs text-t2 leading-relaxed font-sans">{selectedClass.description}</p>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="font-mono text-[9px] text-t3">Itens Iniciais:</span>
                {selectedClass.startingItems.map(item => (
                  <span key={item} className="font-mono text-[9px] uppercase px-2 py-0.5 rounded border border-cyberGreen/10 bg-cyberGreen/5 text-t2">
                    {item.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Lado Direito: Atributos Rolados */}
          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <label className="font-mono text-xs uppercase text-t3 tracking-wider block mb-3">
                Parâmetros Biométricos (Atributos)
              </label>

              {attributes ? (
                <div className="space-y-3 font-mono animate-fade-in">
                  {catalog.attributes.map(attr => {
                    const val = attributes[attr.id] || 10;
                    const mod = getAttributeModifier(val);
                    return (
                      <div key={attr.id} className="flex justify-between items-center p-2.5 rounded border border-t3/10 bg-cyberBg2/50">
                        <div>
                          <span className="text-white text-xs font-semibold">{attr.name}</span>
                          <span className="text-t3 text-[9px] uppercase tracking-widest block">{attr.id}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-cyberGreenLight text-sm font-bold">{val}</span>
                          <span className="text-t2 text-xs ml-2">({mod >= 0 ? `+${mod}` : mod})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-t3/20 rounded-xl h-60 flex flex-col items-center justify-center text-center p-6 bg-cyberBg2/10">
                  <svg className="w-10 h-10 text-t3 animate-pulse mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  <span className="font-mono text-xs text-t2 uppercase">Rolar Parâmetros Biométricos</span>
                  <p className="text-[10px] text-t3 mt-1 max-w-[200px] leading-relaxed">
                    Clique no botão abaixo para rolar seus atributos iniciais usando dados digitais (4d6 drop-lowest).
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {!attributes ? (
                <button
                  type="button"
                  disabled={isRolling}
                  className="w-full btn-primary py-3 px-6 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold text-center"
                  onClick={handleRollAttributes}
                >
                  {isRolling ? 'GERANDO REDE NEURAL...' : 'ROLAR ATRIBUTOS DO DISPOSITIVO'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isRolling}
                    className="btn-ghost flex-1 py-3 px-4 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold text-center"
                    onClick={handleRollAttributes}
                  >
                    Rolar Novamente
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-[2] py-3 px-6 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold text-center"
                  >
                    INICIAR CONEXÃO
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
