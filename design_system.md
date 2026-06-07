# Design System: Synaptic Neural Cyberpunk (Inspiração Graphify)

Este documento descreve o sistema de design construído com base no layout analisado na pasta `setup_design_sistem`. O tema adota uma estética **dark cyberpunk / terminal sci-fi**, combinando elementos de visualizador de grafos neurais, superfícies de vidro ("glassmorphic") e micro-interações dinâmicas.

---

## 1. Fundamentos Visuais

### 1.1 Textura e Efeitos de Fundo
Para que a interface pareça viva e imersiva, aplicamos camadas sutis de textura:
*   **Ruído Estático (Noise):** Um SVG de ruído estático overlay com opacidade ultra-baixa (`0.025`) para simular uma tela analógica.
*   **Scanlines CRT:** Linhas horizontais sutis simulando monitores clássicos.
*   **Grid Verde de Fundo:** Um grid sutil de `48px` por `48px` feito com gradientes lineares.
*   **Orbes Neon (Neural Orbs):** Brilhos orbitais com desfoque radial extremo (`filter: blur(120px)`) que pulsam ou seguem o tom da paleta de cores ativa, adicionando profundidade 3D.

```css
/* Exemplo de aplicação no body e grid */
:root {
  --bg: #040806;
  --bg2: #060d08;
  --glow: 0.55;
}

body {
  background: var(--bg);
  overflow-x: hidden;
}

/* Ruído analógico */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.025;
}

/* Scanlines CRT */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px);
}

/* Grid sutil de fundo */
.grid-bg {
  background-image: 
    linear-gradient(rgba(34, 197, 94, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 197, 94, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
}
```

---

## 2. Paleta de Cores e Temas (Paleta Neural)

O sistema de cores adota o **Verde Primário** como o sinal de disparo da sinapse e um **Acento Secundário** variável (chamado de memória ou segundo sinal).

### 2.1 Cores Base (Padrão `Synaptic`)
*   **Fundo Principal (`--bg`):** `#040806` (verde-escuro quase preto)
*   **Fundo Secundário (`--bg2`):** `#060d08`
*   **Verde Primário (`--green`):** `#22c55e`
*   **Verde Primário Claro (`--green2`):** `#4ade80`
*   **Borda Padrão (`--border`):** `rgba(34, 197, 94, 0.13)`
*   **Superfície de Vidro (`--glass`):** `rgba(34, 197, 94, 0.04)`

### 2.2 Hierarquia de Texto
*   **Principal (`--t1`):** `rgba(220, 255, 220, 0.9)` (verde esbranquiçado de alta legibilidade)
*   **Secundário (`--t2`):** `rgba(220, 255, 220, 0.45)` (tons esmaecidos para rótulos/detalhes)
*   **Terciário (`--t3`):** `rgba(220, 255, 220, 0.22)` (suporte a linhas e desativados)

### 2.3 Variações de Temas (`data-palette`)
Você pode alterar dinamicamente o segundo sinal de acento aplicando atributos no elemento `<html>` (ex: `<html data-palette="synaptic">`):

| Nome do Tema | Atributo | Acento Primário (`--accent`) | Acento Claro (`--accent2`) |
| :--- | :--- | :--- | :--- |
| **Synaptic (Padrão)** | `data-palette="synaptic"` | `#8b5cf6` (Violeta) | `#a78bfa` (Violeta Claro) |
| **Cortex** | `data-palette="cortex"` | `#e0489b` (Rosa/Magenta) | `#f472b6` (Rosa Claro) |
| **Classic** | `data-palette="classic"` | `#f59e0b` (Amber/Laranja) | `#fbbf24` (Amber Claro) |
| **Mono** | `data-palette="mono"` | `#22c55e` (Verde) | `#4ade80` (Verde Claro) |

---

## 3. Tipografia

O sistema de tipografia trabalha com contraste de espaçamento e personalidade de fontes:

*   **Display / Títulos (`--font-display`):** Sora, Space Grotesk ou Bricolage Grotesque.
    *   *Estilo:* Negrito (`font-weight: 600`), letter-spacing negativo (`-0.035em` a `-0.045em`), e altura de linha compacta (`line-height: 0.9`).
*   **Corpo de Texto (`sans`):** Inter, system-ui.
*   **Código / Dados (`mono`):** JetBrains Mono, monospace.

```css
/* Classes de utilidade tipográfica */
.hl {
  font-family: var(--font-display, 'Sora', sans-serif);
  font-weight: 600;
  line-height: 0.9;
  letter-spacing: -0.035em;
}

.mono {
  font-family: 'JetBrains Mono', monospace;
}
```

---

## 4. Componentes CSS

### 4.1 Cards de Vidro (Glass Cards)
Cards translúcidos que utilizam desfoque de fundo e bordas que brilham sutilmente quando o mouse passa por cima.

```css
.glass {
  background: var(--glass);
  border: 1px solid var(--border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: border-color 0.25s, box-shadow 0.3s;
}

.glass:hover {
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow: 0 12px 36px -20px rgba(0, 0, 0, 0.7);
}
```

### 4.2 Bordas de Gradiente Dinâmico (Code Border)
Um efeito premium para caixas de código ou layouts importantes, criando uma borda de degradê de 1px usando máscaras CSS.

```css
.code-border {
  position: relative;
  background: rgba(4, 10, 6, 0.9);
  border-radius: 16px;
}

.code-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px; /* Espessura da borda */
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(139, 92, 246, 0.2), rgba(34, 197, 94, 0.08));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

### 4.3 Botões
*   **Botão Primário:** Fundo gradiente verde, sombra brilhante e efeito de "varredura" (sweep de luz branca) no hover.
*   **Botão Ghost (Fantasma):** Borda verde semi-transparente que se ilumina no hover.

```css
/* Botão Primário */
.btn-primary {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: linear-gradient(135deg, #16a34a, #15803d);
  box-shadow: 0 0 24px rgba(34, 197, 94, 0.3), 0 4px 16px rgba(0, 0, 0, 0.5);
  transition: all 0.25s ease;
  white-space: nowrap;
}

.btn-primary::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.18) 50%, transparent 80%);
  transform: translateX(-130%);
  transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.3, 1);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 0 40px rgba(34, 197, 94, 0.45), 0 4px 24px rgba(0, 0, 0, 0.6);
  transform: translateY(-2px);
}

.btn-primary:hover::after {
  transform: translateX(130%);
}

.btn-primary:active {
  transform: translateY(0) scale(0.985);
}

/* Botão Ghost */
.btn-ghost {
  border: 1px solid rgba(34, 197, 94, 0.22);
  color: rgba(74, 222, 128, 0.65);
  background: rgba(34, 197, 94, 0.025);
  transition: all 0.25s ease;
}

.btn-ghost:hover {
  border-color: rgba(34, 197, 94, 0.45);
  color: rgba(74, 222, 128, 0.95);
  background: rgba(34, 197, 94, 0.07);
  box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.12), 0 0 22px rgba(34, 197, 94, 0.08);
  transform: translateY(-2px);
}
```

### 4.4 Faixa de Estatísticas (Stats Strip)
Uma seção horizontal integrada que exibe dados do sistema com um indicador piscante de "Live/Ativo".

```css
.stats-strip {
  border-top: 1px solid transparent !important;
  border-bottom: 1px solid transparent !important;
  border-image: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.14) 22%, rgba(34, 197, 94, 0.14) 78%, transparent) 1 !important;
  background: linear-gradient(180deg, rgba(6, 13, 8, 0.9), rgba(4, 8, 6, 0.6));
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 22px 30px;
  transition: background 0.25s;
}

.stat-item:hover {
  background: rgba(34, 197, 94, 0.035);
}

.stat-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 30px;
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat-live {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.45);
  animation: stat-pulse 2.2s ease-out infinite;
  vertical-align: middle;
  margin-left: 6px;
}

@keyframes stat-pulse {
  0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.45); }
  70% { box-shadow: 0 0 0 7px rgba(74, 222, 128, 0); }
  100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
}
```

### 4.5 Padrão Decorativo: Chave Grega (Meandro)
Uma linha decorativa que une a tecnologia futurista com um elemento clássico estilizado, servindo de divisor de seções.

```css
.greek-key {
  height: 10px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='10'%3E%3Cpolyline points='0,4 0,0 12,0 12,8 6,8 6,4 16,4' fill='none' stroke='%2322c55e' stroke-width='1' stroke-opacity='0.28' stroke-linejoin='miter' stroke-linecap='square'/%3E%3C/svg%3E");
  background-size: 16px 10px;
  background-repeat: repeat-x;
  background-position: center;
  -webkit-mask-image: linear-gradient(90deg, transparent, black 18%, black 82%, transparent);
  mask-image: linear-gradient(90deg, transparent, black 18%, black 82%, transparent);
  opacity: 0.32;
}
```

---

## 5. Responsividade e Performance Mobile

Para garantir uma boa experiência em dispositivos móveis, o layout deve se adaptar:
1.  **Orbes de Neon:** Reduzir o desfoque radial (para `blur(85px)`) e o tamanho dos orbes para evitar lag de renderização na GPU móvel.
2.  **Grid de Fundo:** O tamanho do grid diminui de `48px` para `32px`.
3.  **Botões:** Tornam-se de largura total (`w-full`) e com área de toque mínima confortável (`52px` de altura).
4.  **Estatísticas:** A faixa horizontal muda de layout flex-row para uma grade 2x2.

---

## 6. Template Básico de Componente (React + Tailwind)

Para criar novas páginas sob esse design system, você pode seguir a estrutura abaixo como referência:

```jsx
import React from 'react';

export default function FeatureCard({ number, title, description }) {
  return (
    <div className="track-card glass rounded-xl p-8 relative overflow-hidden">
      {/* Indicador de passo numérico em Mono */}
      <div className="step-num w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xs font-semibold mb-6 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
        {number}
      </div>
      
      {/* Título de Display com tracking negativo */}
      <h3 className="hl text-xl text-white mb-3 tracking-tight">
        {title}
      </h3>
      
      {/* Corpo de texto em Inter com opacidade secundária */}
      <p className="text-sm leading-relaxed text-[rgba(220,255,220,0.65)]">
        {description}
      </p>
    </div>
  );
}
```
