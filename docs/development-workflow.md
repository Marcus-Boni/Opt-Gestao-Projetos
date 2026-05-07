# Development Workflow

## Objetivo

Definir o fluxo de desenvolvimento do template: scripts, pnpm workspaces, branches, commits, PRs, qualidade local e CI/CD.

Este arquivo não define arquitetura de front-end nem de back-end. Para isso, consulte:

- `docs/frontend.md`
- `docs/backend.md`
- `docs/security.md`

## Papel deste arquivo

Use este documento para responder:

- como instalar e rodar o projeto;
- quais scripts devem existir;
- como organizar commits e branches;
- quando ativar Husky, lint-staged e commitlint;
- como validar mudanças;
- como estruturar PR e CI/CD.

Não use este arquivo para decidir componentes, camadas, banco, autenticação ou estrutura interna de módulos.

## Stack operacional do template

- Node.js: 24 LTS.
- Package manager: pnpm.
- Repositório: monorepo com workspaces.
- Workspaces previstos: `ui-kit`, `frontend`, `backend`.
- Qualidade: ESLint, Prettier, typecheck e testes quando o projeto real for materializado.
- Hooks opcionais: Husky + lint-staged + commitlint.
- Convenção: Conventional Commits.

O `package.json` inicial permanece mínimo. Dependências de aplicação e ferramentas de qualidade devem ser adicionadas quando o projeto real for materializado ou quando a qualidade automática for ativada.

## Estrutura operacional

```txt
.
  ui-kit/
  frontend/
  backend/
  docs/
  package.json
  pnpm-workspace.yaml
```

As pastas `frontend/src/` e `backend/src/` começam mínimas. A IA cria subpastas conforme a feature exigir, seguindo `docs/frontend.md` e `docs/backend.md`.

## pnpm workspace

```yaml
packages:
  - "ui-kit"
  - "frontend"
  - "backend"
```

Não adicionar workspaces por antecipação.

## Scripts raiz

O `package.json` da raiz atua como orquestrador.

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel --if-present dev",
    "build": "pnpm -r --if-present build",
    "lint": "pnpm -r --if-present lint",
    "typecheck": "pnpm -r --if-present typecheck",
    "test": "pnpm -r --if-present test",
    "validate": "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
  }
}
```

A flag `--if-present` evita falhas enquanto um workspace ainda não possui implementação real.

## Scripts mínimos por workspace real

Quando `frontend/` for materializado:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

Quando `backend/` for materializado:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

Quando `ui-kit/` tiver Storybook ativo:

```json
{
  "scripts": {
    "dev": "storybook dev -p 6006",
    "storybook": "storybook dev -p 6006",
    "build": "storybook build",
    "build-storybook": "storybook build",
    "lint:ci": "eslint .",
    "typecheck:ci": "tsc -b"
  }
}
```

`ui-kit/` é uma prateleira visual. O fluxo padrão deve validar o Storybook, mas `lint:ci` e `typecheck:ci` ficam disponíveis para revisão de qualidade da prateleira sem bloquear o template antes da estabilização.

Não adicionar scripts que não funcionam.

## Política de dependências

Antes de adicionar dependência, responder:

1. Qual requisito ela resolve?
2. Ela será usada imediatamente?
3. Já existe alternativa no projeto?
4. É compatível com TypeScript?
5. É mantida e adequada ao uso corporativo?
6. É free/open source para uso comercial?
7. Cria lock-in, SaaS obrigatório ou plano pago para uso básico?
8. Exige atualização de `docs/frontend.md`, `docs/backend.md` ou `docs/security.md`?

É proibido adicionar por padrão:

- biblioteca enterprise;
- ferramenta que exige SaaS para uso básico;
- SDK externo sem necessidade real;
- biblioteca abandonada;
- dependência duplicada para a mesma responsabilidade;
- pacote com licença incompatível;
- ferramenta paga para build, teste, lint, typecheck, CI básico ou deploy básico.

## Política de branches

- `main`: branch protegida e estável.
- `feature/<nome>`: novas funcionalidades.
- `fix/<nome>`: correções.
- `chore/<nome>`: manutenção técnica.

Boas práticas:

- branches curtas;
- PRs pequenos;
- merge apenas com validação verde;
- evitar commits diretos na `main`.

## Ciclo diário

1. Atualizar `main` local.
2. Criar branch de trabalho.
3. Implementar mudança pequena.
4. Rodar validações aplicáveis.
5. Commitar com Conventional Commits.
6. Abrir PR com descrição objetiva.
7. Corrigir feedback.
8. Fazer merge após aprovação.

## Conventional Commits

Formato:

```txt
tipo(escopo-opcional): descricao curta no imperativo
```

Exemplos:

- `feat(frontend): adiciona pagina de dashboard`
- `fix(backend): corrige validacao de token`
- `docs: atualiza regras de project-transcription`
- `chore(workspace): ajusta scripts raiz`

Tipos recomendados:

- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `chore`
- `ci`
- `build`
- `perf`
- `style`

## Qualidade automática opcional

Ative Husky, lint-staged e commitlint quando o projeto real começar a ter código e time trabalhando com PRs.

Instalação sugerida:

```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional prettier
pnpm exec husky init
```

`package.json` raiz com qualidade ativada:

```json
{
  "scripts": {
    "prepare": "husky",
    "dev": "pnpm -r --parallel --if-present dev",
    "build": "pnpm -r --if-present build",
    "lint": "pnpm -r --if-present lint",
    "lint:fix": "pnpm -r --if-present lint:fix",
    "typecheck": "pnpm -r --if-present typecheck",
    "test": "pnpm -r --if-present test",
    "format": "prettier . --write",
    "format:check": "prettier . --check",
    "validate": "pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build"
  }
}
```

### Pre-commit

`.husky/pre-commit`:

```sh
pnpm exec lint-staged
```

`.lintstagedrc.cjs`:

```js
module.exports = {
  "*.{js,jsx,ts,tsx}": ["eslint --fix --max-warnings=0"],
  "*.{json,md,css,scss,html,yml,yaml}": ["prettier --write --ignore-unknown"],
};
```

### Commit-msg

`commitlint.config.cjs`:

```js
module.exports = {
  extends: ["@commitlint/config-conventional"],
};
```

`.husky/commit-msg`:

```sh
pnpm exec commitlint --edit "$1"
```

## Testes e validação

Testes devem acompanhar comportamento verificável, não nascer como estrutura vazia.

Preferência:

1. seguir padrão existente;
2. criar teste próximo ao código alterado;
3. criar pasta transversal somente para contratos, fixtures ou E2E quando houver necessidade real.

Validação mínima por tipo:

| Tarefa           | Validação mínima                     |
| ---------------- | ------------------------------------ |
| Componente       | renderização ou interação principal  |
| Formulário       | validação principal                  |
| Hook             | comportamento observável             |
| Service/use case | regra principal e caso de erro       |
| API              | contrato, status e erro seguro       |
| Auth/permissão   | permitido e negado                   |
| Refactor         | testes existentes continuam passando |
| Bugfix           | teste de regressão                   |

## Definition of Done

Uma tarefa só deve ser considerada pronta quando:

- código compila;
- lint sem problemas relevantes;
- typecheck sem erro;
- testes aplicáveis passam;
- não há segredo hardcoded;
- documentação foi atualizada quando houve impacto;
- riscos restantes foram informados.

## Pull Request

Cada PR deve conter:

- contexto e objetivo;
- o que mudou;
- como validar;
- riscos conhecidos;
- evidências quando aplicável.

Checklist mínimo:

- [ ] Seguiu `AGENTS.md`
- [ ] Seguiu `docs/frontend.md` ou `docs/backend.md` quando aplicável
- [ ] Consultou `docs/security.md` para área sensível
- [ ] Não criou dependência sem justificativa
- [ ] Criou testes quando havia comportamento verificável
- [ ] Rodou validações aplicáveis

## CI/CD recomendado

Pipeline mínimo quando houver código real:

1. preparar Node.js conforme `.nvmrc`;
2. habilitar/instalar pnpm conforme o ambiente de CI;
3. `pnpm install --frozen-lockfile`, quando houver `pnpm-lock.yaml`;
4. `pnpm lint`;
5. `pnpm typecheck`;
6. `pnpm test`;
7. `pnpm build`.

Em ambiente local, `pnpm install` na raiz instala todos os workspaces do monorepo. Em CI, prefira lockfile congelado para garantir reprodutibilidade. Adicionar auditoria, secrets scan e deploy conforme maturidade do projeto.

## Uso de IA no workflow

A IA deve:

- ler `AGENTS.md` primeiro;
- consultar apenas documentos relevantes;
- evitar prompts longos repetitivos;
- fazer mudanças pequenas e revisáveis;
- preservar arquitetura existente em evolução incremental;
- informar validações executadas e não executadas.

A IA não deve:

- criar arquitetura paralela;
- instalar dependência sem necessidade;
- criar pastas vazias por antecipação;
- remover validações para fazer build passar;
- usar ferramenta externa para documento sensível sem autorização.
