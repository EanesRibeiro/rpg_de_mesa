import React, { useState, useEffect } from 'react';
import { getAttributeModifier } from '../game/engine';

export default function DiceRoller({ option, playerState, onComplete, resolvedResult }) {
  const { attribute, DC } = option.check;
  const attrValue = playerState.attributes[attribute] || 10;
  const modifier = getAttributeModifier(attrValue);

  const [isRolling, setIsRolling] = useState(false);
  const [currentNum, setCurrentNum] = useState(20);
  const [finalRoll, setFinalRoll] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // Efeito de rolagem dramática
  const startRoll = () => {
    setIsRolling(true);
    setShowResult(false);
    setFinalRoll(null);
    setScreenShake(false);

    let counter = 0;
    const interval = setInterval(() => {
      // Sorteia números aleatórios rápidos
      setCurrentNum(Math.floor(Math.random() * 20) + 1);
      counter++;

      if (counter > 15) {
        clearInterval(interval);
        
        // Rolo de dados final real
        const roll = Math.floor(Math.random() * 20) + 1;
        setCurrentNum(roll);
        setFinalRoll(roll);
        setIsRolling(false);
        setShowResult(true);

        // Se falha crítica (1 natural), dispara tremor de tela
        if (roll === 1) {
          setScreenShake(true);
        }

        // Notifica o pai para calcular o resultado real
        onComplete(roll);
      }
    }, 90);
  };

  const totalScore = finalRoll ? finalRoll + modifier : null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-cyberBg/90 backdrop-blur-md p-4 transition-all duration-300 ${screenShake ? 'animate-shake' : ''}`}>
      <div className="glass code-border max-w-md w-full p-8 rounded-2xl text-center relative overflow-hidden">
        {/* Glow de acento de fundo */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full filter blur-2xl opacity-10 bg-cyberGreen"></div>
        
        <span className="font-mono text-xs text-cyberGreenLight/80 tracking-widest uppercase mb-2 block">Diretiva de Ação Requerida</span>
        <h2 className="hl text-xl md:text-2xl text-white mb-6 uppercase">Teste de {attribute} (Dificuldade: {DC})</h2>
        
        <p className="text-xs text-t2 mb-8 font-sans">
          Opção: <span className="text-t1 italic">"{option.text}"</span>
        </p>

        {/* Display do Dado D20 */}
        <div className="flex justify-center items-center my-6">
          <div className={`w-32 h-32 flex items-center justify-center relative select-none
            ${isRolling ? 'animate-spin-slow' : ''}
            ${showResult && resolvedResult && resolvedResult.includes('success') ? 'text-cyberGreenLight filter drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]' : ''}
            ${showResult && resolvedResult && resolvedResult.includes('failure') ? 'text-rose-500 filter drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]' : ''}
            ${!showResult ? 'text-t2' : ''}
          `}>
            {/* Desenho do D20 (Polígono do Dado) */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full"
              fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              
              {/* Contorno externo: pentágono irregular simulando icosaedro */}
              <polygon
                points="50,5 95,32 80,88 20,88 5,32"
                className="fill-cyberBg2 stroke-current"
              />
              
              {/* Triângulos internos da face do D20 */}
              <line x1="50" y1="5"  x2="5"  y2="32"/>
              <line x1="50" y1="5"  x2="95" y2="32"/>
              <line x1="5"  y1="32" x2="80" y2="88"/>
              <line x1="95" y1="32" x2="20" y2="88"/>
              <line x1="20" y1="88" x2="80" y2="88"/>
              
              {/* Linhas internas da subdivisão triangular */}
              <line x1="50" y1="5"  x2="50" y2="88"/>
              <line x1="5"  y1="32" x2="95" y2="32"/>
              <line x1="5"  y1="32" x2="50" y2="70"/>
              <line x1="95" y1="32" x2="50" y2="70"/>
              <line x1="20" y1="88" x2="50" y2="32"/>
              <line x1="80" y1="88" x2="50" y2="32"/>
            </svg>
            <span className="font-mono text-4xl font-bold relative z-10">{currentNum}</span>
          </div>
        </div>

        {/* Detalhes do Modificador e Conta */}
        {showResult && resolvedResult && (
          <div className="my-6 animate-fade-in">
            <div className="font-mono text-xs text-t2">
              Dado: {finalRoll} + Modificador {attribute} ({modifier >= 0 ? `+${modifier}` : modifier})
            </div>
            <div className="font-mono text-2xl font-bold text-white mt-1">
              Total: {totalScore} vs DC {DC}
            </div>

            {/* Banner de Resultado */}
            <div className={`mt-4 py-2 px-4 rounded font-mono text-xs uppercase tracking-widest font-semibold inline-block
              ${resolvedResult === 'critical_success' ? 'bg-cyberGreen/20 border border-cyberGreen text-cyberGreenLight animate-pulse' : ''}
              ${resolvedResult === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : ''}
              ${resolvedResult === 'critical_failure' ? 'bg-rose-500/20 border border-rose-500 text-rose-400 animate-bounce' : ''}
              ${resolvedResult === 'failure' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' : ''}
            `}>
              {resolvedResult === 'critical_success' && "✦ SUCESSO CRÍTICO ✦"}
              {resolvedResult === 'success' && "✓ SUCESSO"}
              {resolvedResult === 'critical_failure' && "☠ FALHA CRÍTICA ☠"}
              {resolvedResult === 'failure' && "✗ FALHA"}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="mt-8 flex justify-center">
          {!showResult && !isRolling && (
            <button
              type="button"
              className="btn-primary py-3 px-8 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold"
              onClick={startRoll}
            >
              Rolar Interface D20
            </button>
          )}

          {isRolling && (
            <div className="font-mono text-xs text-cyberGreenLight animate-pulse">
              ANALISANDO TRAJETÓRIA DIGITAL...
            </div>
          )}

          {showResult && resolvedResult && (
            <button
              type="button"
              className="btn-primary py-3 px-8 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold"
              onClick={() => onComplete(finalRoll)}
            >
              Confirmar Transição
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
