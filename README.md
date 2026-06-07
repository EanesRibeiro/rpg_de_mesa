# 🌌 Chiba Grid // RPG de Mesa Cyberpunk

**Um simulador de RPG de mesa cyberpunk interativo com narrativa procedural, testes biométricos (D20) e interface neural de alta fidelidade rodando inteiramente no navegador.**

O **Chiba Grid** coloca o jogador no papel de um mercenário digital (*Solo*, *Netrunner* ou *Techie*) navegando pelas intrigas e perigos do submundo corporativo de Chiba City sob a chuva ácida.

---

## 🚀 Recursos Principais

### 🎲 Motor de Jogo Orientado a Dados (8 Fases - `engine.js`)
Lógica pura e modular de transição de estado, projetada para desacoplamento e robustez:
1. **Validação de Requisitos:** Avalia se a classe do jogador, itens do inventário ou flags do mundo atendem aos pré-requisitos da ação.
2. **Consumo de Custos:** Deduz créditos ou recursos antes da execução da ação.
3. **Teste de Atributos (Check):** Simulação matemática de rolagem clássica de D20 adicionando modificadores clássicos de atributos (*FOR, REF, INT, TECH*).
4. **Resolução de Destino:** Determina a cena destino com base no resultado da rolagem (Sucesso vs Falha com *Fail Forward*).
5. **Aplicação de Efeitos:** Processa itens adicionados ou removidos, calcula danos físicos (HP) ou mentais (Sanidade), altera contadores aritméticos (como reputação ou nível de alerta) e modifica flags globais.
6. **Ajuste de Limites (Clamping):** Garante a integridade dos status vitais do jogador.
7. **Triggers do Sistema:** Monitoramento passivo de condições críticas (como morte do personagem com HP <= 0).
8. **Retorno do Estado e Metadados:** Entrega do novo estado imutável acompanhado de metadados dramáticos da rodada de dados para renderização na UI.

### 🃏 Layout de Mesa de Cartas 3D e Glassmorphism
A interface de escolhas foi evoluída para uma mesa tátil holográfica:
* **Disposição em Leque 3D:** Cartas de opções dispostas dinamicamente em ângulo, emulando uma mão de cartas real na mesa física.
* **Efeitos de Foco Dinâmicos com `:has()`:** Quando uma carta é focada, as cartas adjacentes reagem se afastando ou mudando a opacidade, criando micro-interações fluidas de profundidade tridimensional.
* **Micro-animações Cinematográficas:** Transições síncronas entre as fases do motor de jogo, digitação dramática com proteção de concorrência e efeitos neon pulsantes ajustados à intensidade dramática da cena.

### 🧬 Criação Dinâmica de Personagens
* **Dossiês Biométricos:** Substituição de botões estáticos por cartões de dossiê interativos que revelam dados bio-digitais e equipamentos iniciais.
* **Monitor de Diagnóstico:** Tela estilo terminal com varredura digital sequencial e diagnóstico biométrico dinâmico para os perfis das classes *Solo*, *Netrunner* e *Techie*.

### 🔗 Grafo de Conhecimento e Documentação Interativa (Graphify)
O projeto agora está totalmente indexado e documentado em um grafo de conhecimento em [graphify-out/](file:///c:/Users/eanes/.gemini/antigravity/scratch/rpg_de_mesa/graphify-out/):
* **`graph.json`:** Estrutura relacional contendo os nós e dependências do código AST.
* **`GRAPH_REPORT.md`:** Relatório de arquitetura identificando os "nós centrais" (*God Nodes*), conexões surpreendentes e perguntas de design.
* **`graph.html`:** Visualizador de grafo interativo em 3D e Louvain clustering para abrir diretamente no navegador.
* **`wiki/`:** Uma wiki autogerada legível por agentes contendo documentações para cada comunidade do grafo.

---

## 🛠️ Stack Tecnológica

* **Framework:** React 19, Vite, JavaScript (ESM).
* **Estilização:** TailwindCSS v4.0 + Custom CSS (design neon glassmorphism).
* **Análise e Grafos:** Graphify (Louvain clustering e análise AST).

---

## 💻 Como Executar Localmente

1. Entre no diretório do projeto:
   ```bash
   cd rpg_de_mesa
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Execute os testes automatizados da Engine e Validação do Grafo:
   ```bash
   node src/game/testRunner.js
   ```

---

*Conexão neural estabelecida. Boa sorte na Grade, Runner.*
