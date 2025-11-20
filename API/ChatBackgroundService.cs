using System.Collections.Concurrent;
using System.Linq;
using API.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace API
{
    public class ChatBackgroundService : BackgroundService
    {
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatBackgroundService(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var random = new Random();

            string[] nomesBase =
            {
                "Ana","Bruno","Carlos","Diana","Eduarda","Felipe","Gabriela","Henrique","Isabela",
                "Karen","Leonardo","Marina","Natalia","Otavio","Paula","Rafael","Sofia",
                "Tiago","Vitoria"
            };

            string[] mensagensBase =
            {
                "Olá pessoal!",
                "Alguém testou a nova função?",
                "Estou ajustando o layout agora.",
                "Podemos fazer deploy hoje?",
                "A performance melhorou depois do último commit.",
                "Preciso de ajuda com o SignalR.",
                "Mensagem dinâmica #{i}",
                "Verificando reconexão automática...",
                "Tudo ok por aqui.",
                "Esse recurso ficou ótimo!",
                "Fazendo testes de carga no hub...",
                "Alguém viu o log de erros?",
                "Preparando nova release.",
                "Refatorando o serviço de background.",
                "Testando broadcast para todos.",
                "Latência está estável.",
                "Mensagens estão chegando em ordem?",
                "Simulando cenário de alta concorrência.",
                "Alterando tema da interface.",
                "Integração concluída!"
            };

            // Usuários simulados (apenas aqui)
            var simulatedUsers = new ConcurrentDictionary<string, byte>();

            // Pré-popula simulados
            int iniciais = random.Next(5, 12);
            for (int k = 0; k < iniciais; k++)
            {
                var u = GerarUsuario();
                simulatedUsers.TryAdd(u, 0);
                await _hubContext.Clients.All.SendAsync("userOnline", u, stoppingToken);
            }

            // Primeiro snapshot completo (simulados + reais atuais)
            await EnviarSnapshotCompleto(stoppingToken);

            // Tarefa: fluxo de mensagens
            var mensagensTask = Task.Run(async () =>
            {
                int contador = 0;
                while (!stoppingToken.IsCancellationRequested && contador < 1_000_000)
                {
                    // Escolhe entre simulados + reais sempre incluindo reais
                    var todosUsuarios = simulatedUsers.Keys
                        .Concat(ChatHub.RealUsers)
                        .Distinct()
                        .ToArray();

                    string usuario = todosUsuarios.Length == 0
                        ? GerarUsuario()
                        : todosUsuarios[random.Next(todosUsuarios.Length)];

                    if (todosUsuarios.Length == 0)
                    {
                        simulatedUsers.TryAdd(usuario, 0);
                        await _hubContext.Clients.All.SendAsync("userOnline", usuario, stoppingToken);
                        await EnviarSnapshotCompleto(stoppingToken);
                    }

                    var modelo = mensagensBase[random.Next(mensagensBase.Length)];
                    var mensagem = modelo.Contains("#{i}") ? modelo.Replace("#{i}", contador.ToString()) : modelo;

                    await _hubContext.Clients.All.SendAsync("sendMessage", usuario, mensagem, stoppingToken);

                    contador++;
                    try
                    {
                        await Task.Delay(random.Next(600, 4800), stoppingToken);
                    }
                    catch (TaskCanceledException) { }
                }
            }, stoppingToken);

            // Tarefa: fluxo de presença online (entradas/saídas)
            var presencaTask = Task.Run(async () =>
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    bool adicionar = simulatedUsers.IsEmpty || simulatedUsers.Count < 8 || random.NextDouble() < 0.65;

                    if (adicionar && simulatedUsers.Count < 8)
                    {
                        var novo = GerarUsuarioUnico(simulatedUsers);
                        if (simulatedUsers.TryAdd(novo, 0))
                        {
                            await _hubContext.Clients.All.SendAsync("userOnline", novo, stoppingToken);
                        }
                    }
                    else if (!simulatedUsers.IsEmpty)
                    {
                        var snapshot = simulatedUsers.Keys.ToArray();
                        var sair = snapshot[random.Next(snapshot.Length)];

                        // Nunca remove usuários reais (apenas simulados)
                        if (simulatedUsers.TryRemove(sair, out _))
                        {
                            await _hubContext.Clients.All.SendAsync("userOffline", sair, stoppingToken);
                        }
                    }

                    // Snapshot periódico mesclado
                    await EnviarSnapshotCompleto(stoppingToken);

                    try
                    {
                        await Task.Delay(random.Next(1200, 3500), stoppingToken);
                    }
                    catch (TaskCanceledException) { }
                }
            }, stoppingToken);

            try
            {
                await Task.WhenAll(mensagensTask, presencaTask);
            }
            catch (TaskCanceledException) { }

            // Função local para gerar usuários simulados
            string GerarUsuario()
            {
                var nomeBase = nomesBase[random.Next(nomesBase.Length)];
                return $"{nomeBase}{random.Next(1, 200)}";
            }

            string GerarUsuarioUnico(ConcurrentDictionary<string, byte> dict)
            {
                var u = GerarUsuario();
                for (int t = 0; t < 5 && dict.ContainsKey(u) || ChatHub.RealUsers.Contains(u); t++)
                    u = GerarUsuario();
                return u;
            }

            async Task EnviarSnapshotCompleto(CancellationToken ct)
            {
                var completos = simulatedUsers.Keys
                    .Concat(ChatHub.RealUsers)
                    .Distinct()
                    .ToArray();

                await _hubContext.Clients.All.SendAsync("usersOnline", completos, ct);
            }
        }
    }
}
