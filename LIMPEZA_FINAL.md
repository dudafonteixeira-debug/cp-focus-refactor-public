# CP Focus — limpeza final

## Rotas mantidas

- Dashboard
- Planejamento inteligente
- Modo Foco
- Centro de Estudos e páginas internas de matérias
- Revisão Inteligente
- Banco de Erros
- Adaptive AI
- Evolução
- Recuperação
- Simulados
- Flashcards
- Questões
- Perfil
- Ajuda
- Planos
- Lyra IA
- Login e onboarding

## Rotas legadas removidas

- Calendário e tarefas do calendário
- Planejador IA antigo
- Planejamento antigo
- Planner antigo e missões
- Semana
- Pomodoro antigo
- Progresso antigo
- Relatórios antigos
- Edital
- Flashcards IA antigo
- Diagnóstico do sistema
- Logs de IA
- Admin antigo

## Outros itens removidos

- Componentes exclusivos das telas Semana, Planner e Pomodoro antigas
- Implementação antiga do calendário e sincronização com planner
- Menu lateral antigo
- Arquivos do recurso antigo de edital
- Cópias de diagnóstico e snapshots duplicados dentro de `scripts`
- Backups `*.bak*`, logs, caches e relatórios temporários
- `.next` e `node_modules`

## Verificações realizadas

- Conferência das rotas restantes com a navegação atual.
- Busca por links e redirecionamentos para as rotas removidas.
- Verificação estática de todos os imports locais com alias `@/`: nenhum import local ausente.

## Como executar

```powershell
npm install
npm run dev
```

Para validar a versão de produção:

```powershell
npm run build
```

A instalação completa das dependências excedeu o tempo disponível no ambiente de preparação, por isso o build de produção deve ser executado localmente após `npm install`.
