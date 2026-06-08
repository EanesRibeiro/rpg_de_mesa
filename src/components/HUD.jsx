import React from 'react';

export default function HUD({ player, inventory = [], catalogItems = [], hpDamaged, sanityDamaged, counters = {} }) {
  const hpPercent = player && player.maxHp ? (player.hp / player.maxHp) * 100 : 0;
  const sanityPercent = player && player.maxSanity ? (player.sanity / player.maxSanity) * 100 : 0;

  const hpState = hpPercent > 60 ? 'safe' : hpPercent > 30 ? 'warning' : 'critical';
  const sanityState = sanityPercent > 60 ? 'safe' : sanityPercent > 30 ? 'warning' : 'critical';

  const hpIcon = hpState === 'warning' ? (
    <span className="font-mono text-[9px] text-yellow-500 mr-1">⚠</span>
  ) : hpState === 'critical' ? (
    <span className="font-mono text-[9px] text-rose-500 animate-pulse mr-1">☠</span>
  ) : null;

  const sanityIcon = sanityState === 'warning' ? (
    <span className="font-mono text-[9px] text-purple-500 mr-1">⚠</span>
  ) : sanityState === 'critical' ? (
    <span className="font-mono text-[9px] text-fuchsia-500 animate-pulse mr-1">☠</span>
  ) : null;

  const hpTextState = (
    <span className={`ml-2 text-[8px] font-mono uppercase tracking-widest ${
      hpState === 'safe' ? 'text-cyberGreenLight/80' :
      hpState === 'warning' ? 'text-yellow-500' :
      'text-rose-500 animate-pulse'
    }`}>
      {hpState === 'safe' ? 'ESTÁVEL' : hpState === 'warning' ? 'DEGRADADO' : 'CRÍTICO'}
    </span>
  );

  const sanityTextState = (
    <span className={`ml-2 text-[8px] font-mono uppercase tracking-widest ${
      sanityState === 'safe' ? 'text-indigo-400/80' :
      sanityState === 'warning' ? 'text-purple-500' :
      'text-fuchsia-500 animate-pulse'
    }`}>
      {sanityState === 'safe' ? 'ESTÁVEL' : sanityState === 'warning' ? 'DEGRADADO' : 'CRÍTICO'}
    </span>
  );

  // Mapeia os IDs dos itens no inventário para obter o nome amigável do catálogo
  const getFriendlyItem = (itemId) => {
    if (!catalogItems) return itemId;
    const item = catalogItems.find(i => i.id === itemId);
    return item ? item.name : itemId;
  };

  if (!player) return null;

  // Monta a classe da barra de HP com base no estado
  let hpBarClass = "h-full rounded-full transition-all duration-300 ";
  if (hpState === 'safe') {
    hpBarClass += "bg-gradient-to-r from-cyberGreen to-cyberGreenLight";
  } else if (hpState === 'warning') {
    hpBarClass += "bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
  } else if (hpState === 'critical') {
    hpBarClass += "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse";
  }

  // Monta a classe da barra de Sanidade com base no estado
  let sanityBarClass = "h-full rounded-full transition-all duration-300 ";
  if (sanityState === 'safe') {
    sanityBarClass += "bg-gradient-to-r from-indigo-500 to-indigo-400";
  } else if (sanityState === 'warning') {
    sanityBarClass += "bg-gradient-to-r from-purple-500 to-purple-400";
  } else if (sanityState === 'critical') {
    sanityBarClass += "bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 animate-pulse";
  }

  return (
    <div className="stats-strip w-full relative z-10 border-t border-b py-2 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4">
        {/* Jogador e Classe */}
        <div className="flex items-center gap-3">
          <div className="stat-live"></div>
          <div>
            <span className="font-mono text-xs uppercase text-t3 tracking-wider">Interface Ativa</span>
            <h2 className="font-display font-semibold text-sm md:text-base text-white tracking-tight">
              {player.name} <span className="text-cyberGreenLight/80 font-mono text-xs font-normal">[{player.classId.toUpperCase()}]</span>
            </h2>
          </div>
        </div>

        {/* Status de HP */}
        <div className={`stat-item flex-1 min-w-[150px] max-w-[220px] ${hpDamaged ? 'animate-shake text-rose-500' : ''}`}>
          <div className="flex justify-between w-full font-mono text-[10px] text-t3 tracking-wider mb-1">
            <span>INTEGRIDADE FÍSICA (HP){hpTextState}</span>
            <span>{hpIcon}{player.hp}/{player.maxHp}</span>
          </div>
          <div className="w-full bg-cyberGreen/10 border border-cyberGreen/20 h-2 rounded-full overflow-hidden">
            <div 
              className={hpBarClass}
              style={{ width: `${hpPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Status de Sanidade */}
        <div className={`stat-item flex-1 min-w-[150px] max-w-[220px] ${sanityDamaged ? 'animate-shake text-indigo-400' : ''}`}>
          <div className="flex justify-between w-full font-mono text-[10px] text-t3 tracking-wider mb-1">
            <span>SINAL PSÍQUICO (SANIDADE){sanityTextState}</span>
            <span>{sanityIcon}{player.sanity}/{player.maxSanity}</span>
          </div>
          <div className="w-full bg-indigo-500/10 border border-indigo-500/20 h-2 rounded-full overflow-hidden">
            <div 
              className={sanityBarClass}
              style={{ width: `${sanityPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Nível de Alerta */}
        {counters && counters.nivel_alerta > 0 && (
          <div className="flex items-center gap-1.5 min-w-[120px]">
            <span className="font-mono text-[9px] text-t3 uppercase tracking-wider">
              ALERTA
            </span>
            <div className="flex gap-0.5">
              {[...Array(Math.min(counters.nivel_alerta, 10))].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-3 rounded-sm ${
                    i < 3 ? 'bg-yellow-500/70' :
                    i < 6 ? 'bg-orange-500/70' :
                    'bg-rose-500/70 animate-pulse'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-[9px] text-t3">{counters.nivel_alerta}/10</span>
          </div>
        )}

        {/* Inventário do Jogador */}
        <div className="flex items-center gap-2 max-w-sm overflow-x-auto py-1 scrollbar-hidden">
          {inventory.length === 0 ? (
            <span className="font-mono text-xs text-t3 italic">Inventário Vazio</span>
          ) : (
            inventory.map((itemId, idx) => (
              <span key={`${itemId}-${idx}`} className="badge-bench whitespace-nowrap">
                {getFriendlyItem(itemId)}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
