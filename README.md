# Ocean Crisis Control // Painel de Controle de Crise ODS 14

Este é um web app institucional, científico e interativo focado no **Objetivo de Desenvolvimento Sustentável 14 (Vida na Água)** da ONU. A aplicação simula um painel de monitoramento de crise ecológica global e inclui um simulador multiplayer síncrono em tempo real.

O projeto foi projetado com uma estética estritamente executiva, científica e minimalista, utilizando tons escuros de azul-marinho, ciano brilhante para dados estáveis e coral/vermelho-alerta para problemas ecológicos.

---

## 🛠️ Arquitetura Técnica

O projeto é construído como uma Single Page Application (SPA) reativa e de alta performance utilizando:
- **Core**: HTML5 semântico com roteamento dinâmico via Javascript Vanilla (ES6+).
- **Compilador/Build**: **Vite** para empacotamento otimizado de módulos de produção.
- **Estilização**: **Tailwind CSS v3** integrado ao compilador PostCSS, com paleta de cores personalizada baseada nas profundidades marinhas.
- **Biblioteca de Gráficos**: **Chart.js v4** para a renderização reativa dos gráficos científicos históricos, projeções de poluição e a telemetria do simulador em tempo real.
- **Sincronização Multiplayer**: **Supabase Realtime (WebSockets via Broadcast/Presence)** para coordenação de estado instantânea sem necessidade de banco de dados SQL pesado para a partida.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
Certifique-se de possuir o **Node.js** instalado na máquina.

### Passos para Inicialização

1. Configure a pasta `ocean-crisis-control` como seu diretório/workspace ativo.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento local:
   ```bash
   npm run dev
   ```
   *O Vite abrirá automaticamente o navegador em `http://localhost:3000`.*

---

## 🌐 Configuração do Tempo Real (Supabase)

Para ativar a simulação em tempo real para dois usuários colaborarem simultaneamente (em computadores ou abas diferentes):

1. Acesse o painel do [Supabase](https://supabase.com) e crie um projeto gratuito.
2. Vá em **Project Settings &rarr; API** e obtenha a **Project URL** e a **anon public API key**.
3. Crie um arquivo `.env` na raiz do projeto (ou copie do `.env.example`) e preencha as variáveis de ambiente:
   ```env
   VITE_SUPABASE_URL=https://seu-id-de-projeto.supabase.co
   VITE_SUPABASE_KEY=sua-chave-api-anonima-publica
   ```
4. Reinicie o servidor de desenvolvimento (`npm run dev`).
5. **Dica**: Se as chaves do `.env` estiverem vazias ou ausentes, o app ativa automaticamente um **Modo Offline/Single-Player** amigável de fallback, permitindo que você controle e experimente ambos os papéis diretamente da sua própria janela local!

---

## 📦 Deploy Automático na Vercel

O projeto está totalmente pronto para deploy contínuo na Vercel a partir do seu repositório do GitHub.

1. Suba este projeto para um repositório no seu GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit ODS 14 crisis control dashboard"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/seu-repositorio.git
   git push -u origin main
   ```
2. Acesse a [Vercel](https://vercel.com) e conecte sua conta do GitHub.
3. Importe o repositório do projeto.
4. Nas configurações de Build e Framework, a Vercel detectará o **Vite** automaticamente.
5. Em **Environment Variables**, configure as variáveis se quiser ativar o multiplayer em produção:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
6. Clique em **Deploy**. A cada novo `git push` na branch principal, a Vercel recompilará e atualizará o web app em produção.

---

## 🎮 O Simulador Multiplayer: Lógica de Causa-Efeito

O "Crisis Lab" simula um ecossistema marinho sob estresse ecológico constante:
- **Desgaste Contínuo**: A cada 3 segundos, o ecossistema perde `-1.5%` de saúde, `-1.5%` da população de peixes e ganha `+1.2%` de poluição.
- **Função do Governo (Setor Público)**:
  - Pode decretar **Áreas Marinhas Protegidas (AMP)** e **Subsídios Sustentáveis**.
- **Função da Iniciativa Privada (ONGs/Empresas)**:
  - Pode investir em **Infraestrutura de Reciclagem** e **Rastreio de Frotas via IA**.
- **Lógica de Sinergia e Bloqueio**:
  - *Sufocamento de AMP*: Se o Governo criar uma AMP, mas a Iniciativa Privada mantiver a poluição acima de 50%, a eficácia da área cai 80% e o log acusa: *AMP sufocada pelo excesso de resíduos plásticos*.
  - *Sobrepesca Contínua*: Se a Iniciativa Privada investir em reciclagem, mas o Governo não implantar proteção marinha contra frotas de arrasto, a população de peixes colapsará de qualquer forma.
  - *Sinergia Positiva*: Apenas a combinação inteligente de AMP + Rastreabilidade de Frotas e Reciclagem gera a recuperação e o equilíbrio dinâmico do ecossistema marinho (&gt;90% saúde).
