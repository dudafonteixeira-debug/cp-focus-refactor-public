# Alterações realizadas

## Migração do calendário para o provider/repositório

- Adicionadas as chaves `calendar` e `calendarView` em `lib/data-access/keys.ts`.
- Adicionados métodos de leitura e gravação do calendário em `lib/data-access/app-repository.ts`.
- Incluída a remoção dos dados do calendário em `clearAllLocalUserData`.
- `lib/calendar.ts` deixou de usar diretamente `storage-core` e agora usa o provider configurado (`local` ou `supabase`, com fallback local).
- Funções do calendário foram convertidas para assíncronas e receberam tipos básicos para calendário, tarefas e visualização.
- A construção mensal agora busca progresso e calendário em paralelo.
- A página `app/(app)/calendario/page.tsx` foi adaptada para aguardar as operações assíncronas.
- A página `app/(app)/planejador-ia/page.tsx` foi adaptada para aguardar o registro da sugestão no calendário.

## Validação

A instalação de dependências não foi incluída no ZIP original. A tentativa de instalação no ambiente de trabalho não terminou dentro do limite disponível, portanto a validação completa com `npx tsc --noEmit` deve ser executada na máquina local após `npm install` ou `npm ci`.
