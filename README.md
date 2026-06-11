# ⚓ BlueGigs - Economia Azul Circular (ODS 14 & ODS 8)

O **BlueGigs** é uma plataforma colaborativa desenvolvida com o objetivo de conectar oportunidades de trabalho digno e desenvolvimento socioeconômico (**ODS 8 - Trabalho Decente e Crescimento Econômico**) com ações concretas de preservação e regeneração costeira e marinha (**ODS 14 - Vida de Baixo d'Água**). 

O projeto foi projetado para concorrer ao prêmio de soluções sustentáveis da ONU, oferecendo uma ponte tecnológica entre contratantes ambientais e prestadores de serviços locais em regiões costeiras.

---

## 🌊 O Problema e a Solução

### O Problema
As comunidades pesqueiras e costeiras enfrentam instabilidade econômica devido à escassez de recursos, pesca predatória e falta de oportunidades de emprego qualificadas e seguras (ODS 8). Ao mesmo tempo, nossos oceanos sofrem com poluição por plásticos, branqueamento de corais e degradação de manguezais sem que haja força de trabalho mobilizada o suficiente para conter o dano (ODS 14).

### A Solução
O **BlueGigs** cria um ecossistema de "gig economy" (economia de bicos) voltado para a sustentabilidade marinha. 
- **Contratantes (Posters):** ONGs, hotéis sustentáveis e institutos de pesquisa podem anunciar serviços remunerados de conservação.
- **Prestadores (Doers):** Pescadores artesanais, mergulhadores e moradores locais aceitam essas tarefas, obtendo uma renda complementar digna enquanto salvam o ecossistema marinho local.

---

## 🎯 Alinhamento com as Metas da ONU

### ODS 14: Vida de Baixo d'Água
*   **Meta 14.1:** Prevenir e reduzir significativamente a poluição marinha de todos os tipos (limpeza de microplásticos nas praias).
*   **Meta 14.2:** Gerir de forma sustentável e proteger os ecossistemas marinhos e costeiros (reflorestamento de mangues e monitoramento de recifes).

### ODS 8: Trabalho Decente e Crescimento Econômico
*   **Meta 8.3:** Promover políticas orientadas para o desenvolvimento que apoiem as atividades produtivas, geração de emprego decente e empreendedorismo.
*   **Meta 8.5:** Alcançar o emprego pleno e produtivo e trabalho decente para todas as mulheres e homens.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React.js + Vite (Build rápido, responsividade completa e spa leve).
- **Estilização:** CSS Vanilla com foco em design system oceânico, glassmorphism e animações modernas.
- **Banco de Dados & Auth:** Supabase (Autenticação JWT, tabelas relacionais com PostgreSQL e segurança via Row Level Security - RLS).
- **Deploy:** Vercel.

---

## 📂 Estrutura do Repositório

```text
Fish-Ocean/
├── .env                  # Configurações locais de banco (ignorado no git)
├── .env.example          # Modelo de configuração do Supabase
├── index.html            # Estrutura HTML com otimização SEO e favicon
├── schema.sql            # Script SQL do banco (tabelas, RLS e triggers)
├── DOCUMENTACAO.md       # Relatório acadêmico escrito completo do projeto
└── src/
    ├── App.jsx           # Componente principal do App (Dashboards e UI)
    ├── index.css         # Variáveis de cor HSL e estilização premium
    ├── supabaseClient.js # Conexão do cliente do Supabase
    └── blueGigsApi.js    # Controle de requisições e banco local offline
```

---

## 🚀 Como Executar o Projeto Localmente

1.  **Instalar as dependências:**
    ```bash
    npm install
    ```
2.  **Configurar variáveis de ambiente:**
    Copie o arquivo `.env.example` para `.env` e insira suas credenciais do Supabase:
    ```env
    VITE_SUPABASE_URL=https://sua-url-do-supabase.co
    VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
    ```
    *Nota: Se as chaves não forem inseridas ou contiverem placeholders, o sistema executará automaticamente no **Modo Mock (offline)** utilizando o `localStorage` do navegador, permitindo testar todos os fluxos imediatamente.*

3.  **Iniciar servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

---

## 📝 Documentação Detalhada
Para ler o relatório escrito completo, justificativa, público-alvo detalhado e arquitetura de dados do projeto, acesse o arquivo [DOCUMENTACAO.md](file:///C:/Users/26012478/Documents/Nova%20pasta/Fish+Ocean/DOCUMENTACAO.md) na raiz do repositório.
