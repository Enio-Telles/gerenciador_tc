# gerenciador_tc

## CI / Workflows locais

CI, testes e hooks deste repositório passam a ser conduzidos primariamente por **Local-CI** (`lci`), não pelo GitHub Actions hospedado. Este repositório ainda não tem `.lci.yaml` — rode `lci init` na raiz antes do primeiro workflow (gera config, hooks e baseline de secrets). Ferramenta e docs: `~/repos/local-ci`.

## Merge

Merge (git merge / gh pr merge) é permitido quando o usuário pede explicitamente na conversa, sem precisar de nova confirmação dentro desse mesmo pedido — comportamento padrão do Claude Code, tornado explícito aqui para consistência com os demais repositórios do ecossistema (decisão do usuário, 2026-08-23).
