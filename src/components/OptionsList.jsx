import React, { useState, useEffect } from 'react';
import ActionCard from './ActionCard';
import { checkRequirements } from '../game/engine';

export default function OptionsList({ 
  options, 
  playerState, 
  inventory, 
  flags = {}, 
  counters = {},
  transitionPhase, 
  onSelectOption, 
  onSelectOptionWithCheck 
}) {
  // Estados locais para controlar a transição cinematográfica de clique
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Reseta o estado local quando mudamos de cena (ou seja, quando o motor entra em fase de digitação ou fade)
  useEffect(() => {
    if (transitionPhase === 'typing' || transitionPhase === 'fade-out' || transitionPhase === 'fade-in') {
      setSelectedCardId(null);
      setIsSelecting(false);
    }
  }, [transitionPhase]);

  // Filtra as opções cujos requisitos não são atendidos
  const visibleOptions = options.filter(option => 
    checkRequirements(option, { player: playerState, inventory, flags, counters }).met
  );

  // Gerencia o clique com atraso de 500ms para a animação cinematográfica
  const handleCardClick = (option, idx) => {
    if (isSelecting) return;

    const cardIdentifier = option.id || `card-${idx}`;
    setSelectedCardId(cardIdentifier);
    setIsSelecting(true);

    setTimeout(() => {
      if (option.check) {
        onSelectOptionWithCheck(option);
      } else {
        onSelectOption(option);
      }
    }, 500); // 500ms de animação de clique/descarte antes de disparar a lógica do motor
  };

  // Determina classes para o container do deck
  const containerClass = transitionPhase === 'idle' ? 'phase-idle' : 'phase-typing';
  const selectionClass = isSelecting ? 'has-selection' : '';

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center mt-6">
      {/* Rótulo em Mono indicando instrução para o jogador */}
      <div 
        className="font-mono text-[10px] text-t2 uppercase tracking-wider mb-6 transition-opacity duration-300 select-none"
        style={{ opacity: transitionPhase === 'idle' && !isSelecting ? 1 : 0 }}
      >
        ESCOLHA UMA DIRETIVA DE RESPOSTA // MESA DE CARTAS ATIVA:
      </div>

      {/* Tabuleiro 3D para as cartas */}
      <div className={`cards-deck-container ${containerClass} ${selectionClass}`}>
        {visibleOptions.map((option, idx) => {
          const cardIdentifier = option.id || `card-${idx}`;
          const isCardSelected = selectedCardId === cardIdentifier;
          const isCardDiscarded = isSelecting && !isCardSelected;

          return (
            <ActionCard
              key={cardIdentifier}
              option={option}
              idx={idx}
              total={visibleOptions.length}
              onClick={() => handleCardClick(option, idx)}
              transitionPhase={transitionPhase}
              isSelected={isCardSelected}
              isDiscarded={isCardDiscarded}
            />
          );
        })}
      </div>
    </div>
  );
}
