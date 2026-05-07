# OPTSOLV Blueprint

Template monorepo para desenvolvimento aumentado por IA, preparado para iniciar projetos completos do zero com front-end, back-end ou ambos.

O template usa Markdown local como contexto, `ui-kit/` como prateleira de componentes/UI e regras arquiteturais para evitar que cada agente gere uma estrutura diferente.

## Objetivo

1. Clonar o template para iniciar um novo sistema.
2. Instalar dependências do monorepo com `pnpm install`.
3. Adicionar documentos e requisitos do projeto em `docs/projeto/`.
4. Executar `project-transcription` para gerar `docs/projeto-md/project-requirements.md`.
5. Usar IA/agentes para criar front-end, back-end ou ambos conforme o escopo real.
6. Usar `ui-kit/` como prateleira de componentes, blocks, stories e padrões visuais.
7. Adicionar dependências apenas quando o projeto real exigir.

## Fluxo principal

```txt
Template clonado
→ pnpm install
→ documentos/requisitos em docs/projeto/
→ project-transcription gera project-requirements.md
→ IA lê AGENTS.md + docs necessários
→ IA consulta ui-kit para montar UI
→ IA materializa frontend/backend conforme necessidade real
→ pnpm build / pnpm validate
```

## O que o template entrega

- Monorepo base com `frontend/`, `backend/` e `ui-kit/`.
- `ui-kit/` como prateleira visual: componentes shadcn/ui, blocks, stories e padrões para a IA consultar, copiar/adaptar e materializar no `frontend/`.
- Front-end guiado por IA: React, Vite e TypeScript, com regras de módulos, componentes, rotas, estado, formulários e uso obrigatório da prateleira antes de criar UI nova.
- Back-end condicional: só é criado quando o escopo justificar; se houver banco, o padrão é PostgreSQL; se houver schema/migrations, Drizzle; se houver auth, Better Auth quando fizer sentido.
- Markdown local como cérebro do projeto: `AGENTS.md`, `docs/frontend.md`, `docs/backend.md`, `docs/security.md`, `docs/development-workflow.md` e `docs/project-transcription.md`.
- Baixo consumo de contexto: a IA não precisa ler tudo sempre; ela consulta o arquivo certo para a tarefa certa.
- Poucas pastas iniciais: a estrutura-alvo está documentada, mas a IA só cria subpastas quando a feature exigir.

## Mapa de contexto da IA

```txt
o que construir        → docs/projeto-md/project-requirements.md
como agir              → AGENTS.md
como criar UI          → ui-kit + docs/frontend.md
como criar API         → docs/backend.md
como se proteger       → docs/security.md
como validar/entregar  → docs/development-workflow.md
```

## Estrutura

```txt
.
├─ .agents/
├─ .claude/
├─ backend/
│  └─ src/
├─ docs/
│  ├─ projeto/
│  ├─ projeto-md/
│  ├─ backend.md
│  ├─ development-workflow.md
│  ├─ frontend.md
│  ├─ project-transcription.md
│  └─ security.md
├─ frontend/
│  └─ src/
├─ ui-kit/
├─ .editorconfig
├─ .gitignore
├─ .nvmrc
├─ AGENTS.md
├─ CLAUDE.md
├─ GEMINI.md
├─ package.json
├─ pnpm-workspace.yaml
├─ README.md
└─ skills-lock.json
```

As pastas `frontend/src/` e `backend/src/` começam mínimas de propósito. A IA deve criar subpastas apenas quando a feature exigir, usando as arquiteturas-alvo documentadas em `docs/frontend.md` e `docs/backend.md`.

## Pré-requisitos

- Node.js conforme `.nvmrc`.
- pnpm.
- Git.
- Um agente de IA/IDE/CLI capaz de ler arquivos do repositório.

Verifique:

```bash
node -v
pnpm -v
```

## Como usar este template em um novo projeto

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio> meu-novo-projeto
cd meu-novo-projeto
```

### 2. Instalar dependências

```bash
pnpm install
```

O `pnpm install` deve ser executado na raiz do monorepo. Ele instala as dependências da raiz e dos workspaces definidos em `pnpm-workspace.yaml`:

- `ui-kit/`
- `frontend/`
- `backend/`

O template não versiona `node_modules/`.

Se o `pnpm` não estiver disponível, use Corepack:

```bash
corepack install
corepack pnpm install
```

Opcionalmente, em ambientes onde o Corepack consegue criar shims sem erro de permissão:

```bash
corepack enable
pnpm install
```

Em Windows com NVM, se `corepack enable` falhar por permissão ao criar shims, use `corepack pnpm install` ou instale o pnpm globalmente:

```bash
npm install -g pnpm
pnpm install
```

### 3. Validar a base clonada

```bash
pnpm --filter @optsolv/ui-kit build-storybook
pnpm build
pnpm validate
```

Validações extras da prateleira de UI:

```bash
pnpm --filter @optsolv/ui-kit lint:ci
pnpm --filter @optsolv/ui-kit typecheck:ci
```

### 4. Visualizar o Storybook do `ui-kit/`

```bash
pnpm --filter @optsolv/ui-kit dev
```

Acesse o endereço exibido no terminal, normalmente:

```txt
http://localhost:6006
```

O `ui-kit/` é uma prateleira de componentes, blocks, stories e exemplos baseados em shadcn/ui, Tailwind e Radix quando aplicável.

A aplicação final não deve importar diretamente do `ui-kit/` por padrão. A IA deve consultar, copiar/adaptar e materializar no `frontend/` somente o necessário para o projeto.

### 5. Adicionar requisitos do projeto

Coloque especificações, PDFs, DOCX, XLSX, TXT, ZIPs ou Markdown em:

```txt
docs/projeto/
```

Esses arquivos são a fonte canônica inicial do novo projeto.

### 6. Pedir para a IA gerar requisitos consolidados

Prompt sugerido:

```txt
Leia AGENTS.md.

Execute project-transcription usando os arquivos em docs/projeto/.

Gere ou atualize docs/projeto-md/project-requirements.md e docs/projeto-md/MANIFEST.md.

Não altere arquivos originais em docs/projeto/.
```

### 7. Revisar requisitos consolidados

Antes de implementar, revise:

```txt
docs/projeto-md/project-requirements.md
docs/projeto-md/MANIFEST.md
```

Valide se:

- as fontes foram processadas corretamente;
- requisitos confirmados, inferidos, ambíguos e pendentes estão separados;
- telas, fluxos, entidades, integrações, regras de negócio e permissões foram identificados;
- dúvidas críticas foram marcadas para validação humana.

### 8. Pedir um plano de desenvolvimento para a IA

Antes de implementar, é recomendável pedir um plano curto.

Prompt sugerido:

```txt
Leia AGENTS.md e docs/projeto-md/project-requirements.md.

Crie um plano de desenvolvimento incremental para implementar este projeto do zero.

Indique:
- se haverá apenas front-end, front-end + back-end ou ambos;
- se haverá banco;
- se haverá autenticação;
- quais módulos devem ser criados primeiro;
- quais dependências serão necessárias e em qual workspace;
- quais arquivos/pastas serão materializados em frontend/ e backend/;
- quais riscos ou ambiguidades precisam de validação humana.

Não implemente ainda.
```

### 9. Pedir para a IA implementar o projeto

Prompt sugerido:

```txt
Leia AGENTS.md.

Leia docs/projeto-md/project-requirements.md.

Implemente a primeira versão do projeto seguindo apenas os documentos necessários.

Para front-end:
- consulte docs/frontend.md;
- consulte ui-kit/ antes de criar telas ou componentes;
- use ui-kit/ como prateleira de referência;
- copie/adapte/materialize no frontend/ apenas o necessário para a feature.

Para back-end:
- consulte docs/backend.md;
- crie backend, banco ou autenticação somente se os requisitos justificarem;
- use PostgreSQL quando houver banco;
- use Drizzle quando houver schema/migrations;
- use Better Auth quando houver autenticação e a solução atender ao escopo.

Para segurança:
- consulte docs/security.md se houver dados sensíveis, autenticação, permissões, uploads, integrações, logs ou tokens.

Antes de alterar arquivos protegidos, peça confirmação.
```

### 10. Validar após implementação

Após a IA implementar a primeira versão do sistema:

```bash
pnpm build
pnpm validate
```

Se o agente criar scripts específicos em `frontend/` ou `backend/`, valide também os comandos desses workspaces.

## Sobre o `ui-kit/`

O `ui-kit/` já vem materializado com componentes, blocks, stories e dependências necessárias. O usuário do template não precisa rodar `shadcn add` para começar.

Comandos `shadcn` devem ser usados apenas para manutenção futura da prateleira, não como passo obrigatório de instalação. O fluxo padrão é consultar o `ui-kit/`, copiar/adaptar e materializar no `frontend/` apenas o que o projeto real precisar.

## Arquivos e pastas protegidos

Agentes de IA podem ler, mas não devem alterar, mover, renomear, excluir, reformatar ou sobrescrever sem autorização explícita:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `GEMINI.md`
- `docs/*.md`
- `docs/projeto/`
- `ui-kit/`
- `skills-lock.json`
- arquivos e pastas iniciados com `.`, como `.agents/`, `.claude/`, `.editorconfig`, `.gitignore` e `.nvmrc`

Exceção: durante `project-transcription`, o agente pode criar ou atualizar arquivos em `docs/projeto-md/`.

## Dependências

O `package.json` da raiz é intencionalmente mínimo.

Ele deve conter apenas metadados, package manager e scripts de orquestração do monorepo.

Não instale dependências de aplicação no `package.json` raiz por padrão.

As dependências devem ser adicionadas no workspace correto, somente quando o escopo real exigir:

- `ui-kit/`: Storybook, componentes shadcn/ui, blocks, stories e bibliotecas necessárias à prateleira de UI.
- `frontend/`: React, Vite, TypeScript e bibliotecas usadas pela aplicação front-end.
- `backend/`: Fastify, Drizzle, Better Auth, cliente PostgreSQL e bibliotecas usadas pela API.

Antes de adicionar dependências, consulte:

- `docs/frontend.md` para a matriz de dependências front-end por demanda.
- `docs/backend.md` para a matriz de dependências back-end por demanda.
- `docs/development-workflow.md` para scripts, qualidade e validação.
- `docs/security.md` para dependências sensíveis, autenticação, banco, integrações e dados.

Regra central: a stack é orientada, mas não instalada por antecipação.

## Scripts raiz

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm validate
```

Os scripts usam `pnpm -r --if-present`, então workspaces ainda não materializados não bloqueiam o template.

Quando um workspace ganhar implementação real, seus scripts próprios devem ser criados conforme `docs/development-workflow.md`.

## Documentos principais

- `AGENTS.md`: contrato curto para agentes de IA.
- `docs/frontend.md`: arquitetura front-end, prateleira de UI, componentização, estado, formulários, testes e dependências front-end por demanda.
- `docs/backend.md`: decisão de criação de back-end, arquitetura de API, banco, autenticação, testes e dependências back-end por demanda.
- `docs/development-workflow.md`: processo, scripts, pnpm workspaces, qualidade, commits, PRs e CI/CD.
- `docs/security.md`: segurança, proteção de documentos, prompt injection, secrets, permissões e áreas sensíveis.
- `docs/project-transcription.md`: fluxo operacional para transcrever documentos e consolidar requisitos.

## Regra central

O template deve orientar a IA sem depender de prompt longo.

A IA deve:

- ler `AGENTS.md` primeiro;
- usar os Markdown locais como contexto;
- consultar somente os documentos necessários para a tarefa;
- consultar `ui-kit/` antes de criar UI;
- criar/copiar/adaptar no `frontend/` somente os componentes necessários para a feature;
- criar front-end seguindo `docs/frontend.md`;
- criar back-end seguindo `docs/backend.md` apenas quando necessário;
- criar banco somente quando houver persistência real;
- usar PostgreSQL quando houver banco;
- usar Drizzle quando houver schema/migrations;
- usar Better Auth quando houver autenticação e a solução atender ao escopo;
- adicionar dependências somente por necessidade real;
- preservar segurança seguindo `docs/security.md`;
- evitar criar pastas vazias, arquitetura paralela ou dependências antecipadas.

## Filosofia do template

Poucos arquivos Markdown, mas com responsabilidade clara.

Poucas pastas iniciais, mas com arquitetura-alvo documentada.

Poucas dependências iniciais, mas com stack preferencial definida.

A IA deve ser guiada por documentos locais, requisitos consolidados e padrões existentes, sem improvisar estrutura, UI, banco, autenticação ou bibliotecas.
