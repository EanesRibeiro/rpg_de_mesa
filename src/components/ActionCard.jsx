import React, { useState, useEffect } from 'react';

function useIsMobile(breakpoint = 480) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

export default function ActionCard({
  option,
  idx,
  total,
  onClick,
  transitionPhase,
  isSelected,
  isDiscarded
}) {
  const isMobile = useIsMobile(480);
  const isCheck = !!option.check;

  // Cálculo de leque dinâmico centralizado
  const mid = (total - 1) / 2;
  const rotateDeg = (idx - mid) * 3; // Carta 1: -3deg, Carta 2: 0deg, Carta 3: 3deg (se total for 3)
  const translateYVal = Math.abs(idx - mid) * 5; // Carta 1: 5px, Carta 2: 0px, Carta 3: 5px
  const translateXVal = (idx - mid) * 10; // Leve deslocamento lateral em leque

  // Monta o style inline para o estado padrão (leque)
  // O transitionDelay de entrada só é aplicado se nenhuma carta estiver selecionada/descartada
  const inlineStyle = isMobile
    ? { transitionDelay: isSelected || isDiscarded ? '0ms' : `${idx * 80}ms` }
    : {
        '--rotate-deg': `${rotateDeg}deg`,
        '--translate-y': `${translateYVal}px`,
        '--translate-x': `${translateXVal}px`,
        transitionDelay: isSelected || isDiscarded ? '0ms' : `${idx * 120}ms`,
        transform: `rotate(var(--rotate-deg)) translateY(var(--translate-y)) translateX(var(--translate-x))`
      };

  // Classes de estado adicionais baseadas na fase
  let phaseClass = 'opacity-0 translate-y-[50px] pointer-events-none';
  if (transitionPhase === 'idle') {
    phaseClass = 'opacity-100';
  }

  // Classes de clique (selecionado vs descartado)
  let stateClass = '';
  if (isSelected) {
    stateClass = 'is-selected';
  } else if (isDiscarded) {
    stateClass = 'is-discarded';
  }

  // Classes especiais para opções que são testes (Checks)
  const checkClass = isCheck 
    ? 'border-accent/30 hover:border-accent/70 bg-accent/5' 
    : 'border-t3/10 hover:border-t2/40 bg-cyberGreen/5';

  return (
    <button
      type="button"
      className={`action-card glass code-border flex flex-col justify-between p-5 text-left transition-all duration-500 cursor-pointer ${phaseClass} ${stateClass} ${checkClass}`}
      style={inlineStyle}
      onClick={() => onClick(option)}
      disabled={transitionPhase !== 'idle' || isSelected || isDiscarded}
    >
      {/* Topo do Card: Tipo ou Diretiva */}
      <div className="flex justify-between items-center w-full mb-3">
        <span className="font-mono text-[9px] text-t3 uppercase tracking-wider">
          0{idx + 1} // opt_cmd
        </span>
        {isCheck ? (
          <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border border-accent/30 bg-accent/15 text-accent2 tracking-widest font-semibold">
            TESTE {option.check.attribute}
          </span>
        ) : (
          <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border border-cyberGreen/20 bg-cyberGreen/10 text-cyberGreenLight tracking-widest">
            DIRETIVA
          </span>
        )}
      </div>

      {/* Centro do Card: Texto da escolha */}
      <div className="flex-1 flex items-center py-2">
        <p className="font-sans text-sm leading-relaxed text-t1 select-none">
          {option.text}
        </p>
      </div>

      {/* Rodapé do Card: Metadados */}
      <div className="mt-4 pt-3 border-t border-t3/10 w-full flex justify-between items-center">
        {isCheck ? (
          <span className="font-mono text-[9px] text-accent2 font-semibold">
            DC {option.check.DC}
          </span>
        ) : (
          <span className="font-mono text-[9px] text-t3">
            EXEC_OK
          </span>
        )}
        <span className="font-mono text-[8px] text-t3 tracking-tighter">
          SYS_NODE_{option.id || idx}
        </span>
      </div>
    </button>
  );
}
