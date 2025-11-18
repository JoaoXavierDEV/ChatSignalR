Este arquivo explica como Visual Studio criou o projeto.

As seguintes ferramentas foram usadas para gerar este projeto:
- Angular CLI (ng)

As etapas a seguir foram usadas para gerar este projeto:
- Crie um projeto angular com ng: `ng new AngularSignalR --defaults --skip-install --skip-git `.
- Atualize angular.json com a porta.
- Criar o arquivo de projeto (`AngularSignalR.esproj`).
- Crie `launch.json` para habilitar a depuração.
- Atualize package.json para adicionar `jest-editor-support`.
- Atualize `start` o script no `package.json` para especificar o host.
- Adicionar projeto à solução.
- Grave este arquivo.
