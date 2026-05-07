# Front-end

## Objetivo

Definir como agentes de IA devem criar e evoluir o front-end deste template usando React, Vite, TypeScript e `ui-kit/`.

Este arquivo responde: como organizar UI, telas, rotas, módulos, componentes, estado, formulários, testes e uso da prateleira de componentes.

Não use este arquivo para back-end, segurança geral ou fluxo de Git/CI. Para isso, consulte:

- `docs/backend.md`
- `docs/security.md`
- `docs/development-workflow.md`

## Fontes de verdade

Ordem obrigatória para tarefas de front-end:

1. `AGENTS.md`
2. `docs/projeto-md/project-requirements.md`, quando existir
3. `docs/frontend.md`
4. `ui-kit/`
5. código existente em `frontend/`

`docs/projeto-md/project-requirements.md` define o que construir. `docs/frontend.md` define onde e como colocar o código. `ui-kit/` fornece componentes, tokens, stories e composições para consulta, cópia/adaptação e materialização no `frontend/`.

## Stack padrão

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI como referência técnica para componentes acessíveis quando aplicável
- Storybook dentro de `ui-kit/`

Não adicionar dependências visuais, de estado, formulário, tabela ou gráficos sem necessidade real. Quando houver dúvida, justificar e pedir confirmação.

## Matriz de dependências front-end por demanda

| Necessidade                                  | Preferência                                           | Quando adicionar                                                     | Onde adicionar                                      |
| -------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| App SPA/dashboard                            | React + Vite + TypeScript                             | Ao materializar `frontend/` real                                     | `frontend/`                                         |
| Estilização da aplicação                     | Tailwind CSS                                          | Quando houver UI real a implementar                                  | `frontend/`                                         |
| Componentes base acessíveis                  | `ui-kit/`, shadcn/ui e primitivos acessíveis          | Quando houver tela/componente real a implementar                     | consultar `ui-kit/`; materializar no `frontend/`    |
| Prateleira de UI documentada                 | Storybook                                             | Quando `ui-kit/` for executável, documentado ou evoluído             | `ui-kit/`                                           |
| Formulários                                  | React Hook Form + Zod                                  | Quando houver formulário com validação real                          | `frontend/`                                         |
| Server state/cache                           | TanStack Query                                        | Quando consumir API com loading/error/cache/invalidação              | `frontend/`                                         |
| Estado global simples                        | Zustand                                               | Só quando estado local/hooks/context não bastarem                    | `frontend/`                                         |
| Estado global complexo                       | Redux Toolkit                                         | Apenas com fluxo global complexo e justificativa                     | `frontend/`                                         |
| Tabelas funcionais                           | TanStack Table                                        | Quando houver tabela com ordenação/filtro/paginação                  | `frontend/`                                         |
| Gráficos simples                             | Recharts                                              | Quando houver dashboard ou gráfico simples                           | `frontend/`                                         |
| E2E                                          | Playwright                                            | Quando houver fluxo crítico validável                                | raiz ou `frontend/`, conforme padrão adotado        |
| Testes de componente/hook                    | Vitest + Testing Library                              | Quando houver comportamento verificável                              | `frontend/`                                         |

Antes de adicionar qualquer item, verifique se já existe dependência equivalente no workspace ou padrão consolidado no projeto.

## Regra principal de UI

Antes de criar qualquer componente visual em `frontend/`, a IA deve verificar `ui-kit/`.

Procurar nesta ordem:

1. componente existente;
2. variante existente;
3. token existente;
4. padrão visual em Storybook;
5. composição semelhante em stories ou exemplos.

Se existir equivalente, copie/adapte e materialize no `frontend/` somente o necessário para a feature. Não importe diretamente de `ui-kit/` no `frontend/`, salvo decisão explícita. Não altere `ui-kit/` sem autorização explícita.

## Estrutura física mínima do template

O repositório entrega apenas:

```txt
frontend/
  src/
```

Subpastas devem ser criadas pela IA conforme a necessidade real da feature.

## Estrutura-alvo quando houver aplicação real

```txt
frontend/
  src/
    app/
      bootstrap/
      providers/
      routes/
      layouts/
      App.tsx
      main.tsx

    modules/
      [module]/
        components/
        pages/
        hooks/
        services/
        schemas/
        types/
        utils/

    shared/
      components/
      hooks/
      utils/
      constants/
      validators/
      lib/
      services/
      types/

    config/
      env.ts
      routes.ts
      permissions.ts
      navigation.ts
      feature-flags.ts

    styles/
      globals.css

    assets/

    types/
```

Crie somente as pastas necessárias. Não materialize a árvore inteira por antecipação.

## Responsabilidades

### `app/`

Composição e inicialização da aplicação.

Pode conter:

- bootstrap;
- providers globais;
- rotas;
- guards;
- layouts;
- inicialização de sessão;
- componentes raiz.

Regra: `app/` não deve conter regra de negócio de feature.

### `modules/`

Domínios funcionais da aplicação.

Cada módulo pode conter, quando necessário:

- `components/`
- `pages/`
- `hooks/`
- `services/`
- `schemas/`
- `types/`
- `utils/`

Regra: código específico de um domínio deve permanecer no módulo desse domínio.

### `shared/`

Código reutilizável entre módulos da mesma aplicação.

Use `shared/` apenas quando houver reutilização real ou papel fundacional.

Não use `shared/` como pasta de descarte. Comece local no módulo e promova depois, com justificativa.

### `ui-kit/`

Prateleira de componentes, padrões, tokens, tema, stories e exemplos de UI.

Use como referência para:

- componentes base;
- padrões de composição;
- estados visuais;
- tokens e tema;
- exemplos em Storybook;
- templates de tela.

A aplicação `frontend/` não deve depender diretamente de detalhes internos do `ui-kit/`. O padrão inicial é consultar, copiar/adaptar e materializar no `frontend/` apenas o que a feature exigir.

### `config/`

Configuração global da aplicação: ambiente, rotas, permissões, navegação e feature flags.

### `styles/`

CSS global mínimo da aplicação. Tokens, tema e padrões visuais devem seguir a referência do `ui-kit/`.

### `assets/`

Recursos estáticos da aplicação: imagens, ícones e ilustrações específicas do produto.

## Decisão de componentização

Use esta árvore de decisão:

1. Existe componente ou padrão equivalente em `ui-kit/`?
   - Sim: copie/adapte e materialize no `frontend/` apenas o necessário.
   - Não: seguir.
2. É específico de um módulo ou tela?
   - Sim: criar em `modules/[module]/components/`.
   - Não: seguir.
3. É usado por múltiplos módulos da mesma aplicação?
   - Sim: criar em `shared/components/`.
   - Não: manter local.
4. É reutilizável entre projetos?
   - Sim: sinalizar como candidato para evolução do `ui-kit/`, mas não alterar a prateleira automaticamente.

## Páginas

Pages devem:

- compor layout e fluxo;
- conectar hooks e componentes;
- delegar regra complexa para hooks, services ou schemas;
- evitar CSS solto;
- evitar regra de negócio extensa.

## Rotas e layouts

- Rotas devem ficar em `app/routes/` ou `config/routes.ts`.
- Pages ficam dentro dos módulos.
- Layouts globais ficam em `app/layouts/`.
- Guards ficam no nível de `app/` ou perto da configuração de rotas.
- Permissões visíveis na UI devem refletir regras vindas dos requisitos e do back-end.

## Services front-end

Use `modules/[module]/services/` para:

- chamadas de API do domínio;
- adaptação de payload;
- normalização de dados;
- integração externa ligada ao módulo.

Use `shared/services/` apenas para:

- client HTTP base;
- interceptadores globais;
- helpers de transporte;
- integrações realmente usadas por múltiplos módulos.

Não crie camada de API genérica antes de existir contrato real.

## Formulários

- UI específica: `modules/[module]/components/`.
- Schemas: `modules/[module]/schemas/`.
- Tipos: `modules/[module]/types/`.
- Campos reutilizáveis da aplicação: `shared/components/`.
- Inputs base e padrões visuais: consultar `ui-kit/`.

Validações devem ser explícitas e rastreáveis. Não esconda validação crítica em page grande.

## Estado

Preferência:

1. estado local com `useState`, `useReducer` ou hook local;
2. server state/cache com TanStack Query quando houver API real;
3. contexto para estado transversal simples;
4. store global apenas com justificativa clara.

Não use estado global para dado que pode permanecer local.

## Estados de interface

Fluxos com dados remotos devem considerar:

- loading;
- empty;
- error;
- success;
- retry quando fizer sentido;
- feedback acessível ao usuário.

Use padrões e componentes encontrados em `ui-kit/` sempre que possível.

## Convenções de nome

- Componentes: `PascalCase.tsx`.
- Hooks: `useNome.ts`.
- Services: `dominio.service.ts`.
- Schemas: `nome.schema.ts`.
- Types: `dominio.types.ts`.
- Utils: nome por intenção, não `helper.ts` genérico.

## Testes front-end

Criar testes quando houver comportamento verificável:

- componente com renderização condicional;
- formulário com validação;
- hook com estado ou comportamento reutilizável;
- fluxo com loading/empty/error/success;
- interação principal do usuário;
- bugfix visual ou comportamental.

Preferência:

1. seguir padrão já existente;
2. teste próximo ao código alterado;
3. usar pasta transversal somente para fixtures, contratos ou E2E quando necessário.

Não instalar dependência de teste sem justificativa e confirmação.

## Quando divergir

Divergências são permitidas somente com justificativa explícita quando:

- requisito do projeto exige stack diferente;
- projeto existente já possui padrão consolidado;
- `ui-kit/` ainda não cobre o caso;
- acessibilidade, performance ou segurança exigem outro caminho.

## Proibições

A IA não deve:

- criar UI do zero sem consultar `ui-kit/`;
- importar diretamente de `ui-kit/` no `frontend/` sem decisão explícita;
- alterar `ui-kit/` sem autorização;
- criar paleta, escala ou tema paralelo sem justificativa;
- promover componente para compartilhado cedo demais;
- instalar biblioteca visual sem necessidade real;
- gerar a árvore inteira de pastas sem feature que a justifique;
- ignorar requisitos consolidados em `docs/projeto-md/project-requirements.md`.
