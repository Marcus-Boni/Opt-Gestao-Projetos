# Back-end

## Objetivo

Definir quando criar back-end e como organizar API, regras de negócio, persistência, autenticação e testes quando o projeto exigir servidor.

Este arquivo responde: quando criar back-end, quando não criar, quando criar banco, quais camadas usar e como evitar ambiguidade para agentes de IA.

Não use este arquivo para front-end ou fluxo de Git/CI. Para isso, consulte:

- `docs/frontend.md`
- `docs/development-workflow.md`
- `docs/security.md`

## Fontes de verdade

Ordem obrigatória para tarefas de back-end:

1. `AGENTS.md`
2. `docs/projeto-md/project-requirements.md`, quando existir
3. `docs/backend.md`
4. `docs/security.md`, se houver banco, auth, dados sensíveis, upload, permissões ou integração externa
5. código existente em `backend/`

## Stack padrão

- Node.js
- TypeScript
- Fastify como framework padrão/referência
- PostgreSQL quando houver banco
- Drizzle para schema e migrations quando houver banco
- Better Auth quando houver autenticação e ele atender ao requisito
- pnpm workspaces

Não usar Express por padrão. Express só é aceitável se o projeto existente já usar, se houver requisito explícito ou se houver justificativa aprovada.

## Matriz de dependências back-end por demanda

Esta matriz orienta a IA sobre preferências técnicas. Ela não autoriza instalar tudo por padrão.

A IA deve adicionar dependências somente quando o requisito real exigir, no workspace correto e com justificativa.

| Necessidade | Preferência inicial | Quando adicionar | Workspace esperado |
|---|---|---|---|
| API Node | Fastify + TypeScript | Quando houver back-end real | `backend/` |
| Execução TypeScript em desenvolvimento | tsx | Quando houver `server.ts` executável em desenvolvimento | `backend/` |
| Build TypeScript | TypeScript | Quando o back-end for materializado | `backend/` |
| Validação de entrada | Zod ou schema equivalente | Quando houver body, query, params, webhook, job ou integração externa | `backend/` |
| Banco relacional | PostgreSQL | Quando houver persistência, entidades, histórico, permissões ou auth | infraestrutura + `backend/` |
| ORM/schema/migrations | Drizzle | Quando houver banco, schema ou migrations | `backend/` |
| Cliente PostgreSQL | postgres ou driver compatível com Drizzle | Quando Drizzle/PostgreSQL forem usados | `backend/` |
| Autenticação | Better Auth | Quando houver login, sessão ou usuários e a solução atender ao escopo | `backend/` |
| Variáveis de ambiente | dotenv e/ou validação tipada de env | Quando houver configuração externa | `backend/` |
| Testes de service/use case/API | Vitest | Quando houver regra verificável, contrato HTTP ou bugfix | `backend/` |
| HTTP testing | ferramenta compatível com Fastify/Vitest | Quando houver endpoint crítico a validar | `backend/` |
| Logging | logger compatível com Fastify | Quando houver necessidade real de logs estruturados | `backend/` |
| Filas/jobs | biblioteca de fila/job adequada ao caso | Somente quando houver processamento assíncrono, agendamento ou retry | `backend/` |

Antes de adicionar qualquer item, verifique se já existe dependência equivalente no workspace ou padrão consolidado no projeto.

## Regra principal

Não crie back-end por antecipação.

Crie back-end quando a especificação indicar necessidade real ou quando a necessidade puder ser inferida com segurança.

Se houver dúvida, pergunte de forma objetiva.

## Árvore de decisão

### 1. Não criar back-end

Use apenas front-end quando:

- aplicação for estática;
- dados forem temporários;
- persistência real não for necessária;
- integração externa puder ser usada com segurança sem expor segredo;
- regra de negócio puder permanecer no cliente sem risco.

Exemplos:

- landing page;
- dashboard estático;
- protótipo de UI sem persistência;
- simulador local sem dados sensíveis.

### 2. Criar back-end sem banco

Crie back-end sem banco quando houver:

- regra de negócio server-side sem persistência;
- proxy seguro para API externa;
- proteção de segredo/token;
- validação server-side;
- webhook sem armazenamento;
- processamento temporário.

### 3. Criar back-end com banco

Crie back-end + PostgreSQL + Drizzle quando houver:

- entidades;
- DER;
- persistência;
- histórico;
- relacionamentos;
- auditoria;
- usuários;
- permissões;
- autenticação;
- dados que precisam sobreviver à sessão.

### 4. Criar back-end com auth

Se a especificação pedir autenticação e Better Auth atender:

- criar back-end;
- usar PostgreSQL;
- usar Drizzle para schema/migrations;
- criar tabelas necessárias de usuário/sessão conforme a biblioteca;
- revisar `docs/security.md` antes de finalizar.

## Estrutura física mínima do template

O repositório entrega apenas:

```txt
backend/
  src/
```

Subpastas devem ser criadas pela IA conforme a necessidade real da feature.

## Estrutura-alvo quando houver back-end real

```txt
backend/
  src/
    app/
      create-app.ts
      plugins/
      middlewares/

    modules/
      [module]/
        routes/
        controllers/
        use-cases/
        services/
        repositories/
        entities/
        schemas/
        types/
        mappers/

    db/
      client.ts
      schema/
      migrations/

    config/
      env.ts

    shared/
      errors/
      http/
      logger/
      utils/
      types/

    server.ts
```

Crie somente as pastas necessárias. Não materialize a árvore inteira por antecipação.

## Responsabilidades das camadas

### `app/`

Composição do servidor:

- criação da instância Fastify;
- registro de plugins;
- middlewares/hooks globais;
- registro de rotas;
- configuração de erro global.

Não colocar regra de negócio em `app/`.

### `modules/[module]/routes/`

Define rotas HTTP do módulo e conecta cada rota ao controller correspondente.

Rotas não devem conter regra de negócio.

### `modules/[module]/controllers/`

Camada HTTP:

- ler params/query/body;
- chamar schema de validação;
- chamar use case ou service;
- formatar resposta;
- converter erros conhecidos para resposta segura.

Controllers não devem acessar banco diretamente.

### `modules/[module]/use-cases/`

Casos de uso da aplicação.

Use quando houver fluxo de negócio, orquestração ou operação que combine múltiplos services/repositories.

### `modules/[module]/services/`

Serviços de domínio ou integração local do módulo.

Use para regras reutilizáveis dentro do módulo, cálculos, integração com providers ou operações que não pertencem ao controller.

### `modules/[module]/repositories/`

Acesso a persistência do módulo.

Repositories escondem detalhes de Drizzle/SQL do restante da aplicação.

Não espalhe queries em controllers ou use cases.

### `modules/[module]/entities/`

Modelos de domínio quando houver regra ou comportamento associado à entidade.

Não criar entidade vazia se um tipo/schema simples resolver.

### `modules/[module]/schemas/`

Schemas de validação de entrada, saída e contratos internos.

Toda entrada externa deve ser validada.

### `db/`

Configuração de banco:

- client;
- schema Drizzle;
- migrations;
- helpers estritamente ligados à persistência.

Só criar `db/` quando houver banco.

### `config/env.ts`

Leitura e validação de variáveis de ambiente.

Nunca criar `.env` real. Use `.env.example` com valores fictícios quando necessário.

### `shared/`

Código realmente compartilhado no back-end:

- erros base;
- tipos globais;
- logger;
- helpers HTTP;
- utils reutilizados por múltiplos módulos.

Não usar `shared/` como pasta de descarte.

## Fluxo de request recomendado

```txt
route -> controller -> schema -> use-case/service -> repository -> db
```

Variações são aceitáveis quando a feature for simples, mas a separação mínima deve preservar legibilidade e teste.

## Contratos de API

- Não inventar contrato não especificado.
- Validar entrada em toda fronteira HTTP.
- Tipar payloads.
- Retornar apenas dados necessários.
- Não vazar stack trace, SQL, token, header sensível ou detalhe interno.
- Atualizar documentação quando contrato público mudar.

## Banco e migrations

Quando houver banco:

- usar PostgreSQL;
- usar Drizzle para schema/migrations;
- criar migrations junto com alteração de schema;
- não alterar schema sem revisar impacto;
- não criar seed ou script de dados destrutivo sem confirmação;
- não salvar connection string real no repositório.

## Autenticação e autorização

Quando houver autenticação:

- preferir Better Auth se atender ao requisito;
- considerar que auth induz backend e banco;
- validar sessão/permissão no servidor;
- não confiar apenas no front-end;
- não criar bypass de login para facilitar teste;
- não alterar modelo de roles sem revisão.

## Integrações externas

Criar adapter/service claro para integração externa.

Não expor SDK de terceiro em controllers ou use cases sem necessidade.

Se a integração exigir token, chave ou segredo, consultar `docs/security.md`.

## Jobs, filas e tarefas assíncronas

Não criar pasta de jobs por antecipação.

Crie estrutura específica apenas quando houver requisito real de:

- processamento assíncrono;
- agendamento;
- fila;
- retentativa;
- integração em lote.

## Testes back-end

Criar testes quando houver comportamento verificável:

- service com regra de negócio;
- use case com fluxo;
- validação de entrada;
- endpoint/contrato HTTP;
- regra de autorização;
- repository com query relevante;
- integração externa com mock/adapter;
- bugfix de regra.

Prioridade:

1. teste de service/use case;
2. teste de contrato para endpoint crítico;
3. teste de regressão para bug corrigido;
4. testes transversais apenas quando necessários.

Não instalar dependência de teste sem justificativa e confirmação.

## SOLID e simplicidade

SOLID deve orientar separação de responsabilidades, não virar burocracia.

Evite:

- abstração sem uso real;
- interfaces vazias;
- repository genérico cedo demais;
- service que apenas repassa chamada;
- arquitetura complexa para CRUD simples.

## Quando divergir

Divergências são permitidas somente com justificativa explícita quando:

- o projeto existente já possui padrão consolidado;
- requisito de performance, domínio ou otimização exige arquitetura especializada;
- integração impõe restrição técnica;
- a especificação define stack diferente;
- o grupo aprova exceção.

## Proibições

A IA não deve:

- criar back-end se o front-end resolve com segurança;
- criar banco sem necessidade de persistência;
- criar auth sem requisito explícito ou inferência forte;
- usar banco diferente de PostgreSQL sem justificativa aprovada;
- usar ORM diferente de Drizzle sem justificativa aprovada;
- criar Express por padrão;
- espalhar query de banco fora de repositories;
- acessar banco direto no controller;
- criar estrutura grande de pastas vazias;
- commitar `.env` real ou segredo;
- remover validação ou permissão para fazer teste passar.
