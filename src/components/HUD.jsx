import React from 'react';

export default function HUD({ player, inventory = [], catalogItems = [] }) {
  const hpPercent = player && player.maxHp ? (player.hp / player.maxHp) * 100 : 0;
  const sanityPercent = player && player.maxSanity ? (player.sanity / player.maxSanity) * 100 : 0;

  // Mapeia os IDs dos itens no inventário para obter o nome amigável do catálogo
  const getFriendlyItem = (itemId) => {
    if (!catalogItems) return itemId;
    const item = catalogItems.find(i => i.id === itemId);
    return item ? item.name : itemId;
  };

  if (!player) return null;

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
        <div className="stat-item flex-1 min-w-[150px] max-w-[220px]">
          <div className="flex justify-between w-full font-mono text-[10px] text-t3 tracking-wider mb-1">
            <span>INTEGRIDADE FÍSICA (HP)</span>
            <span>{player.hp}/{player.maxHp}</span>
          </div>
          <div className="w-full bg-cyberGreen/10 border border-cyberGreen/20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyberGreen to-cyberGreenLight h-full rounded-full transition-all duration-300"
              style={{ width: `${hpPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Status de Sanidade */}
        <div className="stat-item flex-1 min-w-[150px] max-w-[220px]">
          <div className="flex justify-between w-full font-mono text-[10px] text-t3 tracking-wider mb-1">
            <span>SINAL PSÍQUICO (SANIDADE)</span>
            <span>{player.sanity}/{player.maxSanity}</span>
          </div>
          <div className="w-full bg-indigo-500/10 border border-indigo-500/20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${sanityPercent}%` }}
            ></div>
          </div>
        </div>

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
