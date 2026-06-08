import React, { useEffect, useRef } from 'react';

export default function SessionLog({ entries }) {
  const bottomRef = useRef(null);

  // Auto-scroll para a entrada mais recente
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries]);

  const getEntryStyle = (type, result) => {
    if (type === 'scene') return 'text-cyberGreenLight font-semibold';
    if (type === 'dice') {
      if (result === 'critical_success') return 'text-cyberGreenLight';
      if (result === 'success')          return 'text-emerald-400';
      if (result === 'failure')          return 'text-rose-400';
      if (result === 'critical_failure') return 'text-rose-500 font-semibold';
    }
    if (type === 'effect') return 'text-t2';
    return 'text-t3';
  };

  const getPrefix = (type, result) => {
    if (type === 'scene')  return '[CENA]';
    if (type === 'dice') {
      if (result?.includes('success')) return '[✓]';
      if (result?.includes('failure')) return '[✗]';
      return '[D20]';
    }
    if (type === 'effect') return '[EFT]';
    return '[SYS]';
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2
                      border-b border-cyberGreen/10">
        <span className="font-mono text-[9px] uppercase tracking-widest text-t3">
          Terminal // Session Log
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyberGreenLight animate-pulse"></span>
          <span className="font-mono text-[8px] text-t3">{entries.length} eventos</span>
        </div>
      </div>

      {/* Entradas */}
      <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-hidden
                      pr-1 min-h-0">
        {entries.length === 0 ? (
          <p className="font-mono text-[9px] text-t3 italic">
            Aguardando transmissão neural...
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex gap-1.5 animate-fade-in"
            >
              <span className="font-mono text-[8px] text-t3 shrink-0 mt-0.5 w-16">
                {entry.timestamp}
              </span>
              <div className="flex gap-1 flex-1 min-w-0">
                <span className={`font-mono text-[8px] shrink-0 mt-0.5
                  ${getEntryStyle(entry.type, entry.result)}`}>
                  {getPrefix(entry.type, entry.result)}
                </span>
                <span className={`font-mono text-[8px] leading-relaxed break-words
                  ${getEntryStyle(entry.type, entry.result)}`}>
                  {entry.text}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Rodapé decorativo */}
      <div className="mt-3 pt-2 border-t border-cyberGreen/10">
        <div className="font-mono text-[8px] text-t3 flex justify-between">
          <span>NEURAL_LINK: ATIVO</span>
          <span className="animate-pulse">█</span>
        </div>
      </div>
    </div>
  );
}
