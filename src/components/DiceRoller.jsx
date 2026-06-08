import React, { useState, useEffect } from 'react';
import { getAttributeModifier } from '../game/engine';

export default function DiceRoller({ option, playerState, onComplete, resolvedResult }) {
  const { attribute, DC } = option.check;
  const attrValue = playerState.attributes[attribute] || 10;
  const modifier = getAttributeModifier(attrValue);
  const resultType = resolvedResult;

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

        {/* Container holográfico do D20 */}
        <div className="flex justify-center items-center my-8 relative">

          {/* Anel orbital externo */}
          <div className={`absolute w-48 h-48 rounded-full border
            border-cyberGreen/20
            ${isRolling ? 'animate-spin-slow' : ''}
            ${showResult && resultType?.includes('success')
              ? 'border-cyberGreenLight/40 shadow-[0_0_30px_rgba(74,222,128,0.2)]'
              : ''}
            ${showResult && resultType?.includes('failure')
              ? 'border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.2)]'
              : ''}
          `}
            style={{
              background: 'radial-gradient(ellipse at center, transparent 60%, rgba(34,197,94,0.03) 100%)'
            }}
          />

          {/* Anel orbital interno com velocidade diferente */}
          <div className={`absolute w-36 h-36 rounded-full border
            border-dashed border-cyberGreen/10
            ${isRolling ? 'animate-spin-reverse-slow' : ''}
          `} />

          {/* Partículas de luz — pontos orbitando */}
          {isRolling && (
            <>
              <div className="absolute w-2 h-2 rounded-full bg-cyberGreenLight
                              shadow-[0_0_8px_rgba(74,222,128,0.8)]
                              animate-orbit-1" />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-accent
                              shadow-[0_0_6px_rgba(139,92,246,0.8)]
                              animate-orbit-2" />
              <div className="absolute w-1 h-1 rounded-full bg-cyberGreen
                              shadow-[0_0_4px_rgba(34,197,94,0.8)]
                              animate-orbit-3" />
            </>
          )}

          {/* Glow de resultado ao redor do dado */}
          {showResult && (
            <div className={`absolute w-32 h-32 rounded-full filter blur-xl opacity-30
              ${resultType?.includes('success') ? 'bg-cyberGreen' : 'bg-rose-500'}
              ${resultType === 'critical_success' || resultType === 'critical_failure'
                ? 'animate-pulse opacity-50' : ''}
            `} />
          )}

          {/* O dado D20 em si */}
          <div className={`w-28 h-28 flex items-center justify-center relative
            select-none z-10
            ${isRolling ? 'animate-bounce-subtle' : ''}
            ${showResult && resultType?.includes('success')
              ? 'filter drop-shadow-[0_0_20px_rgba(74,222,128,0.6)]' : ''}
            ${showResult && resultType?.includes('failure')
              ? 'filter drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]' : ''}
            ${!showResult ? 'filter drop-shadow-[0_0_8px_rgba(34,197,94,0.2)]' : ''}
          `}>
            {/* SVG D20 com geometria correta (da melhoria anterior) */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full"
              fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <polygon points="50,5 95,32 80,88 20,88 5,32"
                className="fill-cyberBg2 stroke-current" />
              <line x1="50" y1="5"  x2="5"  y2="32"/>
              <line x1="50" y1="5"  x2="95" y2="32"/>
              <line x1="5"  y1="32" x2="80" y2="88"/>
              <line x1="95" y1="32" x2="20" y2="88"/>
              <line x1="20" y1="88" x2="80" y2="88"/>
              <line x1="50" y1="5"  x2="50" y2="88"/>
              <line x1="5"  y1="32" x2="95" y2="32"/>
              <line x1="5"  y1="32" x2="50" y2="70"/>
              <line x1="95" y1="32" x2="50" y2="70"/>
              <line x1="20" y1="88" x2="50" y2="32"/>
              <line x1="80" y1="88" x2="50" y2="32"/>
            </svg>

            {/* Máscara de fundo para limpar as linhas de trás do número */}
            <div className="absolute w-12 h-12 rounded-full bg-cyberBg2 border border-current/15 z-10 shadow-[inset_0_0_6px_rgba(34,197,94,0.1)]" />

            {/* Número do dado */}
            <span className="font-mono text-3xl font-bold relative z-20 text-white">
              {currentNum}
            </span>
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
