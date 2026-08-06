# Limpeza estrutural realizada

## Mantido
- Todas as páginas presentes na barra lateral atual.
- A central Lyra IA (`/ia`).
- Rotas internas de matérias e tópicos.
- Login, onboarding, APIs, layouts e arquivos compartilhados utilizados pelo produto atual.

## Removido
- Calendário e calendário de tarefas.
- Planejador IA antigo.
- Rotas antigas/redirecionadoras de planejamento e planner.
- Semana antiga e seus componentes exclusivos.
- Pomodoro antigo (o produto atual usa Modo Foco).
- Progresso antigo (o produto atual usa Evolução).
- Relatórios, Edital, Flashcards IA, Diagnóstico, Logs IA e Admin antigos.
- Backups `.bak`, arquivos de diagnóstico, logs e artefatos temporários.
- Código e chaves de armazenamento exclusivos do calendário antigo.

## Ajustes de navegação
- Links que abriam `/semana` agora abrem `/planejamento-inteligente`.
- O término do onboarding agora abre o Planejamento atual.

## Observação
A pasta `node_modules` e a pasta `.next` não fazem parte deste pacote. Elas são geradas localmente e normalmente representam a maior parte do espaço ocupado durante o desenvolvimento.

## Validação técnica neste ambiente
- Foi feita uma busca por referências às rotas e componentes removidos.
- Não foram encontradas referências ativas ao calendário antigo.
- A instalação completa das dependências excedeu o limite do ambiente; por isso, `tsc`, lint e build devem ser confirmados no computador, aproveitando o `node_modules` já instalado no projeto original.
