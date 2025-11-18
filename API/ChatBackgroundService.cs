using System.Diagnostics;
using API.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace API
{
    public class ChatBackgroundService : BackgroundService
    {
        private readonly IHubContext<API.Hubs.ChatHub> _hubContext;

        public ChatBackgroundService(IHubContext<API.Hubs.ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            for (int i = 0; i < 1000 && !stoppingToken.IsCancellationRequested; i++)
            {
                await Task.Delay(1000, stoppingToken);
                await _hubContext.Clients.All.SendAsync("sendMessage", $"Usuario{i}", $"Mensagem{i}", stoppingToken);
                Debug.WriteLine($"Enviada Mensagem{i} de Usuario{i}");
            }
        }
    }
}
