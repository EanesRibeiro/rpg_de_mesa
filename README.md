# 🌌 Chiba Grid // RPG de Mesa Cyberpunk

**Um jogo de RPG interativo cyberpunk com narrativa procedural e testes biométricos (D20), rodando inteiramente no navegador.**

O **Chiba Grid** coloca o jogador no papel de um mercenário digital (Solo, Netrunner ou Techie) navegando pelo submundo corporativo de Chiba City sob a chuva ácida.

---

## 🚀 Recursos Principais

### 🎲 Motor de Jogo de 8 Fases (`engine.js`)
Lógica de jogo pura e desacoplada, dividida em fases claras:
1. **Validação de Requisitos**: Checa se a classe ou itens exigidos no inventário estão presentes.
2. **Consumo de Custos**: Deduz créditos ou recursos (se aplicável).
3. **Teste de Atributos (Check)**: Rola dados D20 adicionando modificadores clássicos de atributos do sistema D20 clássico.
4. **Resolução de Destino**: Transiciona o jogador para a nova cena.
5. **Aplicação de Efeitos**: Processa itens ganhos, perdidos, dano físico (HP) ou mental (Sanidade) e ativação de flags globais do mundo.
6. **Ajuste de Limites (Clamping)**: Garante que os status permaneçam nos limites corretos.
7. **Triggers do Sistema**: Processa condições de fim de jogo automática (HP ou Sanidade zerados).
8. **Retorno de Novo Estado e Metadados**: Retorna o estado imutável atualizado com metadados detalhados para exibição dramática.

### 🌀 Inícios Aleatórios e Imprevisibilidade Neural
Cada nova sessão neural sorteia um ponto de partida único e um item extra útil no inventário, aumentando a rejogabilidade:
* **A Conexão no Neon Noir (`cena_inicio`)**: Início clássico no bar Chiba Grid com o contato da Militech.
* **Despertar no Beco de Trás (`cena_inicio_beco_entrada`)**: Acordando atordoado na chuva ácida sob a espreita de um capanga dos Red Eyes.
* **Despertar sob a Faca (`cena_inicio_clinica_entrada`)**: Saindo de uma cirurgia clandestina incompleta com uma ciberdívida pendente.

### 🔬 Outros Recursos
* **Validação de Grafo do Mundo**: Sistema de análise estática (`validator.js`) para garantir que o mapa de cenas de `world.json` não possua duplicidades ou referências órfãs.
* **Digitação Dramática Fluida**: Exibição letra a letra das narrativas corrigida contra race conditions em renderizações concorrentes.
* **Design System Dinâmico**: O tema (visual neon) e o tom emocional mudam de cor no navegador de acordo com a cena atual.

---

## 🛠️ Stack Tecnológica

* **Core**: React 19, Vite, JavaScript (ES6+).
* **Estilização**: TailwindCSS v4.0 + Custom CSS (design neon glassmorphism).

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
