import React from 'react';
import { getAttributeModifier } from '../game/engine';

export default function HUDVertical({ player, inventory = [], catalogItems = [], hpDamaged, sanityDamaged, counters = {} }) {
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

  const getFriendlyItem = (itemId) => {
    if (!catalogItems) return itemId;
    const item = catalogItems.find(i => i.id === itemId);
    return item ? item.name : itemId;
  };

  if (!player) return null;

  let hpBarClass = "h-full rounded-full transition-all duration-300 ";
  if (hpState === 'safe') {
    hpBarClass += "bg-gradient-to-r from-cyberGreen to-cyberGreenLight";
  } else if (hpState === 'warning') {
    hpBarClass += "bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
  } else if (hpState === 'critical') {
    hpBarClass += "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse";
  }

  let sanityBarClass = "h-full rounded-full transition-all duration-300 ";
  if (sanityState === 'safe') {
    sanityBarClass += "bg-gradient-to-r from-indigo-500 to-indigo-400";
  } else if (sanityState === 'warning') {
    sanityBarClass += "bg-gradient-to-r from-purple-500 to-purple-400";
  } else if (sanityState === 'critical') {
    sanityBarClass += "bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 animate-pulse";
  }

  const attributesList = [
    { key: 'PHY', label: 'PHY' },
    { key: 'REF', label: 'REF' },
    { key: 'INT', label: 'INT' },
    { key: 'TEC', label: 'TEC' },
    { key: 'WIL', label: 'WIL' }
  ];

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in text-left">
      {/* Nome e classe no topo */}
      <div className="flex items-center justify-between pb-2 border-b border-cyberGreen/10">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] uppercase tracking-widest text-t3">
            Status do Agente
          </span>
          <h2 className="font-display font-semibold text-base text-white tracking-tight mt-0.5">
            {player.name}
          </h2>
          <span className="text-cyberGreenLight/80 font-mono text-[9px] uppercase tracking-wider mt-0.5">
            [{player.classId.toUpperCase()}]
          </span>
        </div>
        <div className="stat-live shrink-0"></div>
      </div>

      {/* Barras de HP e Sanidade */}
      <div className="space-y-3">
        {/* HP */}
        <div className={`stat-item-vertical ${hpDamaged ? 'animate-shake text-rose-500' : ''}`}>
          <div className="flex justify-between w-full font-mono text-[9px] text-t3 tracking-wider mb-1">
            <span>INTEGRIDADE (HP){hpTextState}</span>
            <span>{hpIcon}{player.hp}/{player.maxHp}</span>
          </div>
          <div className="w-full bg-cyberGreen/10 border border-cyberGreen/20 h-2 rounded-full overflow-hidden">
            <div 
              className={hpBarClass}
              style={{ width: `${hpPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Sanidade */}
        <div className={`stat-item-vertical ${sanityDamaged ? 'animate-shake text-indigo-400' : ''}`}>
          <div className="flex justify-between w-full font-mono text-[9px] text-t3 tracking-wider mb-1">
            <span>SINAL (SANIDADE){sanityTextState}</span>
            <span>{sanityIcon}{player.sanity}/{player.maxSanity}</span>
          </div>
          <div className="w-full bg-indigo-500/10 border border-indigo-500/20 h-2 rounded-full overflow-hidden">
            <div 
              className={sanityBarClass}
              style={{ width: `${sanityPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Atributos em formato mono compacta */}
      <div className="pt-2 border-t border-cyberGreen/10">
        <span className="font-mono text-[9px] uppercase tracking-widest text-t3 mb-2 block">
          Diagnóstico de Hardware
        </span>
        <div className="font-mono text-[10px] text-t2 space-y-1 bg-cyberBg2/30 p-2.5 rounded border border-cyberGreen/10">
          {attributesList.map(({ key, label }) => {
            const val = player.attributes[key] || 10;
            const mod = getAttributeModifier(val);
            const modSign = mod >= 0 ? '+' : '';
            const formattedVal = String(val).padStart(2, '0');
            return (
              <div key={key} className="flex justify-between items-center">
                <span className="text-cyberGreenLight">{label}</span>
                <span>{formattedVal}</span>
                <span className={mod >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  ({modSign}{mod})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicador Nível de Alerta */}
      {counters && counters.nivel_alerta > 0 && (
        <div className="pt-2 border-t border-cyberGreen/10 flex flex-col gap-1.5">
          <span className="font-mono text-[9px] text-t3 uppercase tracking-wider">
            ALERTA SISTEMA: {counters.nivel_alerta}/10
          </span>
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`h-2.5 rounded-sm flex-1 ${
                  i < counters.nivel_alerta
                    ? i < 3 ? 'bg-yellow-500/70 shadow-[0_0_6px_rgba(234,179,8,0.3)]' :
                      i < 6 ? 'bg-orange-500/70 shadow-[0_0_8px_rgba(249,115,22,0.3)]' :
                      'bg-rose-500/70 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse'
                    : 'bg-cyberGreen/5 border border-cyberGreen/10'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inventário */}
      <div className="pt-2 border-t border-cyberGreen/10 flex-1 flex flex-col min-h-0">
        <span className="font-mono text-[9px] uppercase tracking-widest text-t3 mb-2 block">
          Sub-Rotinas Carregadas
        </span>
        {inventory.length === 0 ? (
          <span className="font-mono text-[9px] text-t3 italic">Inventário Vazio</span>
        ) : (
          <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-hidden max-h-[140px]">
            {inventory.map((itemId, idx) => (
              <span 
                key={`${itemId}-${idx}`} 
                className="badge-bench w-full justify-center text-center text-[10px] py-1.5 px-3 whitespace-nowrap overflow-hidden text-ellipsis rounded border border-cyberGreen/10 bg-cyberGreen/5 text-t2"
                title={getFriendlyItem(itemId)}
              >
                {getFriendlyItem(itemId)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
