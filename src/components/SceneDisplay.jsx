import React, { useState, useEffect, useRef } from 'react';

export default function SceneDisplay({ scene, onTypingComplete }) {
  const [displayedBody, setDisplayedBody] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const bodyText = scene.body;
  const speed = 12; // Velocidade de digitação em ms por caractere
  const typingTimer = useRef(null);
  const index = useRef(0);

  // Reseta e digita sempre que a cena mudar
  useEffect(() => {
    setDisplayedBody("");
    setIsTyping(true);
    index.current = 0;
    
    if (typingTimer.current) {
      clearInterval(typingTimer.current);
    }

    typingTimer.current = setInterval(() => {
      if (index.current < bodyText.length) {
        // Revela caractere por caractere extraindo síncronamente do tick do timer
        const nextChar = bodyText.charAt(index.current);
        setDisplayedBody(prev => prev + nextChar);
        index.current += 1;
      } else {
        clearInterval(typingTimer.current);
        setIsTyping(false);
        if (onTypingComplete) {
          onTypingComplete();
        }
      }
    }, speed);

    return () => {
      if (typingTimer.current) {
        clearInterval(typingTimer.current);
      }
    };
  }, [scene.id, bodyText, onTypingComplete]);

  // Função para pular a digitação e mostrar tudo imediatamente
  const skipTyping = () => {
    if (isTyping) {
      clearInterval(typingTimer.current);
      setDisplayedBody(bodyText);
      setIsTyping(false);
      if (onTypingComplete) {
        onTypingComplete();
      }
    }
  };

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto mb-8 cursor-pointer select-none" onClick={skipTyping}>
      {/* Título da Cena */}
      <h1 className="hl text-2xl md:text-4xl text-white mb-6 uppercase tracking-tight">
        {scene.title}
      </h1>

      {/* Corpo Narrativo */}
      <div className="glass code-border p-6 md:p-8 rounded-xl min-h-[140px] text-base leading-relaxed text-t1/90 transition-all duration-300">
        <p className="font-sans">
          {displayedBody}
          {isTyping && <span className="cursor"></span>}
        </p>
        
        {/* Dica de clique para pular */}
        {isTyping && (
          <div className="mt-4 font-mono text-[9px] text-t3 uppercase text-right tracking-wider animate-pulse">
            Clique para pular animação _
          </div>
        )}
      </div>
    </div>
  );
}
