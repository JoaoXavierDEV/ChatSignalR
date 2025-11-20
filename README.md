# Chat SignalR Angular

Projeto de demonstração de chat em tempo real com presença de usuários utilizando Angular (Standalone + Signals) e ASP.NET Core SignalR.

<img width="1793" height="317" alt="Captura de tela 2025-11-20 174248" src="https://github.com/user-attachments/assets/bda30fb3-8d30-4118-bc03-98e761c9393d" />

## Tecnologias

- Angular 21 (Standalone Components, Signals para estado reativo)
- ASP.NET Core (.NET) + SignalR
- Comunicação em tempo real (broadcast + eventos incrementais)
- BackgroundService simulando usuários e mensagens

## Arquitetura (Visão Geral)

- ChatHub mantém usuários reais em memória (ConcurrentDictionary).
- ChatBackgroundService simula entradas/saídas e envia snapshots completos.
- Fluxos separados:
  - Mensagens: evento sendMessage
  - Presença incremental: userOnline / userOffline
  - Snapshot completo: usersOnline
  - Parcial (apenas reais): usersOnlineRealPartial (se usado)
- Front-end:
  - Lista de usuários observa usersOnline (snapshot).
  - Toasts exibem cada userOnline por 4s.
  - Form baseado em Signals.

## Eventos SignalR

| Evento | Descrição |
| ------ | --------- |
| sendMessage | Mensagem de chat para todos |
| userOnline | Usuário entrou (incremental) |
| userOffline | Usuário saiu (incremental) |
| usersOnline | Lista completa (reais + simulados) |
| usersOnlineRealPartial | Lista parcial somente de reais (opcional) |

## Reconexão

Configurada com backoff: 0ms, 2000ms, 5000ms, 10000ms. Ao descarregar a página a conexão é parada (beforeunload) para limpeza adequada.

## Componentes Front-end

- chat-view: área principal (envio de mensagem + mensagens)
- chat-online: toasts de presença incremental
- chat-list-online: lista observável dos usuários online
- signalr.service: encapsula HubConnection e listeners

## Fluxo de Presença

1. Usuário real chama PublicarUsuarioOnline.
2. Hub emite userOnline.
3. Lista atualiza incrementando; toast exibe entrada.
4. BackgroundService adiciona/remover simulados e emite snapshots periódicos (usersOnline).
5. Saída real/simulada dispara userOffline removendo da lista.

## Estrutura (Resumo)

````text
API/
  Hubs/ChatHub.cs
  ChatBackgroundService.cs
Angular/
  src/app/
    chat/
      chat-view/
      chat-online/
      chat-list-online/
    services/signalr.service.ts
