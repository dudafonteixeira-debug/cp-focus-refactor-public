# Lote 2 — Dashboard

## Alterações

- A página do Dashboard deixou de concentrar carregamento, persistência, analytics e navegação.
- Criado `hooks/use-dashboard.ts` para controlar o estado e as ações da tela.
- Criado `lib/dashboard/analytics.ts` para os cálculos do Dashboard.
- Criado `lib/dashboard/types.ts` para os tipos do módulo.
- Adicionado tratamento visual de erro de carregamento e salvamento.
- A conclusão de tarefas agora usa atualização otimista com restauração automática se o salvamento falhar.
- Removida a leitura de flashcards que era executada, mas não era usada pela interface.
- Centralizada a construção das rotas das tarefas.

## Validação no Windows PowerShell

```powershell
npm install
npx tsc --noEmit
npm run build
```
