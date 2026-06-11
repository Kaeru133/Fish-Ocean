# 📄 Relatório de Projeto Escrito - BlueGigs (ODS 14 & ODS 8)

Este documento contém a parte escrita conceitual e técnica do aplicativo **BlueGigs**, detalhando sua motivação, justificativa, público-alvo, alinhamento com as diretrizes da Organização das Nações Unidas (ONU) e arquitetura de engenharia de software.

---

## 1. Introdução e Justificativa

O oceano cobre mais de 70% da superfície terrestre, regula o clima do planeta e serve como fonte de sustento para bilhões de pessoas. Contudo, a saúde marítima está gravemente ameaçada pela poluição terrestre, plásticos, pesca predatória e falta de fiscalização adequada. Nas comunidades costeiras, a degradação ambiental anda de mãos dadas com a vulnerabilidade social: à medida que os recursos marinhos decaem, pescadores locais e suas famílias perdem estabilidade financeira, sendo empurrados para o subemprego ou para a informalidade sem condições dignas.

O **BlueGigs** nasce como uma proposta tecnológica e social para reverter esse cenário de forma sustentável e descentralizada. Em vez de tratar a preservação ambiental e o crescimento econômico como forças opostas, a plataforma une a **ODS 14 (Vida de Baixo d'Água)** e a **ODS 8 (Trabalho Decente e Crescimento Econômico)** em um ciclo virtuoso de economia azul circular. 

Pescadores costeiros, mergulhadores e residentes locais deixam de ser apenas espectadores da degradação de seu ecossistema e passam a ser os **prestadores de serviços ambientais ativos**, recebendo compensações financeiras justas financiadas por hotéis da região, ONGs de conservação, institutos de pesquisa e órgãos públicos.

---

## 2. Objetivos do Projeto

### Objetivo Geral
Desenvolver um aplicativo web responsivo que sirva como um marketplace colaborativo costeiro, conectando contratantes de serviços ecológicos a prestadores de serviços locais, promovendo renda sustentável e proteção ativa aos oceanos.

### Objetivos Específicos
1.  **Fomentar a Economia Azul Costeira:** Garantir que trabalhadores locais possam converter seu conhecimento prático do mar (navegação, mergulho, áreas geográficas) em renda complementar.
2.  **Facilitar Ações da ODS 14:** Simplificar a publicação, contratação e execução de tarefas de limpeza de praias, monitoramento científico e reflorestamento de mangues.
3.  **Prover Transparência Financeira:** Criar um ambiente seguro onde cada serviço possui remuneração descrita e acordada de antemão.
4.  **Engajar Empresas e ONGs:** Oferecer aos hotéis locais (turismo sustentável) e ONGs marinhas uma ferramenta direta para coordenar ações e contratar profissionais da própria comunidade, estimulando o crescimento econômico local.

---

## 3. Alinhamento Detalhado com as ODS (ONU)

Para concorrer ao prêmio da ONU, o projeto foca em metas específicas e mensuráveis de duas ODS prioritárias:

### ODS 14 - Vida de Baixo d'Água
*   **Conservação e Restauração de Ecossistemas:** O aplicativo segmenta as vagas em categorias cruciais como *Monitoramento de Recifes de Corais*, *Preservação de Manguezais* (plantio de mudas e limpeza de estuários) e *Remoção de Espécies Invasoras* (como o peixe-leão).
*   **Mitigação da Poluição Costeira:** Foco em mutirões de varredura fina de microplásticos nas praias e remoção de redes de pesca fantasmas nos recifes costeiros.

### ODS 8 - Trabalho Decente e Crescimento Econômico
*   **Trabalho Seguro e Remuneração Justa:** Ao contrário de trabalhos voluntários informais e desestruturados, cada serviço anunciado no BlueGigs exige a indicação de uma recompensa financeira explícita, promovendo o trabalho decente e valorizando a mão de obra local.
*   **Estímulo ao Turismo Sustentável e Empregos Verdes:** Hotéis e operadoras de turismo da costa podem financiar ações de limpeza de recifes, gerando empregos locais temporários e melhorando a qualidade ambiental da atração turística.

---

## 4. Público-Alvo e Níveis de Acesso

O aplicativo divide seus usuários em dois perfis de acesso bem delimitados para facilitar a usabilidade de ambas as partes:

### A. Quem Oferta o Serviço (Contratante / Poster)
*   **Perfil:** ONGs ecológicas, cooperativas de turismo marítimo, institutos de oceanografia e biologia marinha, hotéis costeiros e prefeituras de cidades litorâneas.
*   **Funcionalidades:**
    *   Cadastrar novas vagas de trabalho de preservação marítima (gigs).
    *   Definir título, descrição detalhada do trabalho, valor pago em dinheiro, localização exata e categoria do ODS.
    *   Acompanhar o progresso dos serviços e realizar a validação e conclusão quando finalizados.

### B. Quem Executa o Serviço (Prestador / Doer)
*   **Perfil:** Pescadores artesanais locais, mergulhadores certificados, estudantes de biologia/oceanografia, voluntários engajados e moradores de regiões litorâneas.
*   **Funcionalidades:**
    *   Visualizar o feed em tempo real com todas as vagas de preservação abertas.
    *   Filtrar vagas por categoria (ex: limpeza de praias, monitoramento de corais) para encontrar o serviço ideal.
    *   Candidatar-se e aceitar serviços.
    *   Acessar o "Perfil Azul" para listar certificações (ex: PADI Open Water, biologia) e receber avaliações por estrelas que validam sua qualidade de trabalho.

---

## 5. Modelagem do Banco de Dados (PostgreSQL)

O banco de dados relacional (Supabase/PostgreSQL) foi estruturado de forma otimizada para garantir a rastreabilidade e integridade das ações:

### Tabela `profiles`
Armazena as informações complementares das contas cadastradas na autenticação do Supabase:
*   `id` (UUID, Primary Key): ID do usuário na autenticação.
*   `role` (TEXT): Restrito a `'poster'` (contratante) ou `'doer'` (prestador).
*   `name` (TEXT): Nome da instituição ou do profissional.
*   `bio` (TEXT): Descrição institucional ou currículo resumido do prestador.
*   `skills` (TEXT[]): Habilidades costeras cadastradas pelo prestador.
*   `rating` (NUMERIC): Avaliação por estrelas calculada de 1.0 a 5.0.

### Tabela `gigs`
Armazena os serviços e seu progresso:
*   `id` (UUID, Primary Key): ID único do serviço.
*   `title` (TEXT): Título da atividade ecológica.
*   `description` (TEXT): Instruções e detalhes.
*   `reward` (NUMERIC): Compensação financeira em R$.
*   `location` (TEXT): Praia ou região litorânea da atividade.
*   `category` (TEXT): Categoria específica (Limpeza, Monitoramento, Educação, etc.).
*   `status` (TEXT): Status do andamento (`'open'`, `'in_progress'`, `'completed'`).
*   `poster_id` (UUID, Foreign Key): ID do contratante que publicou a vaga.
*   `doer_id` (UUID, Foreign Key): ID do prestador que aceitou a vaga (anulável se o status for `open`).

---

## 6. Segurança e Regras de Negócio (Row Level Security)

Para garantir um ecossistema seguro no Supabase, foram aplicadas as seguintes regras de segurança a nível de linha (RLS - Row Level Security) no banco de dados:

1.  **Privacidade de Perfil:** Qualquer usuário logado pode ler perfis para verificar a reputação do prestador/contratante, mas alterações e escritas na tabela `profiles` são estritamente restritas ao proprietário do ID (`auth.uid() = id`).
2.  **Criação de Vagas:** Apenas usuários com o papel (role) cadastrado como `'poster'` possuem permissão para realizar inserções na tabela `gigs`.
3.  **Candidaturas:** Prestadores (`doer`) só podem atualizar a coluna `doer_id` de um gig se o status atual da vaga for `'open'` (evitando roubo de vagas em andamento).
4.  **Finalização:** Apenas o proprietário original que criou a vaga (`poster_id = auth.uid()`) possui a permissão de atualizar o status do gig para `'completed'` e liberar a recompensa.
