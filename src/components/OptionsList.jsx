import React from 'react';

export default function OptionsList({ 
  options, 
  playerState, 
  inventory, 
  showOptions, 
  onSelectOption, 
  onSelectOptionWithCheck 
}) {
  if (!showOptions) return null;

  // Valida se os requisitos de classe e item da opção são atendidos
  const areRequirementsMet = (option) => {
    if (!option.requirements) return true;
    const { classId, itemId } = option.requirements;
    
    if (classId && playerState.classId !== classId) return false;
    if (itemId && !inventory.includes(itemId)) return false;
    
    return true;
  };

  // Filtra as opções cujos requisitos não são atendidos (remove do DOM)
  const visibleOptions = options.filter(areRequirementsMet);

  const handleOptionClick = (option) => {
    if (option.check) {
      onSelectOptionWithCheck(option);
    } else {
      onSelectOption(option);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col gap-3 animate-fade-in">
      <div className="font-mono text-[10px] text-t3 uppercase tracking-wider mb-1">
        Escolha uma diretiva de resposta:
      </div>
      {visibleOptions.map((option, idx) => {
        const isCheck = !!option.check;
        return (
          <button
            key={option.id || idx}
            type="button"
            className={`w-full text-left p-4 rounded-lg font-sans text-sm md:text-base border transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
              ${isCheck 
                ? 'btn-ghost hover:border-cyberGreenLight/60 text-cyberGreenLight border-cyberGreen/20 bg-cyberGreen/5' 
                : 'btn-ghost border-t3/10 hover:border-t2/40 text-t1 hover:text-white'
              }
            `}
            onClick={() => handleOptionClick(option)}
            style={{ 
              animationDelay: `${idx * 150}ms`,
              animation: 'fuUp .3s ease forwards'
            }}
          >
            <div className="flex items-center gap-3 w-full">
              <span className="font-mono text-xs text-t3 font-bold flex-shrink-0">0{idx + 1} //</span>
              <span className="flex-1">{option.text}</span>
              {isCheck && (
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded border border-cyberGreen/30 bg-cyberGreen/10 text-cyberGreenLight tracking-widest font-semibold flex-shrink-0">
                  TESTE {option.check.attribute} (DC {option.check.DC})
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
