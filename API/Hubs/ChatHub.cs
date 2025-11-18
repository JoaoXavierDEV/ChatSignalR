using Microsoft.AspNetCore.SignalR;

namespace API.Hubs;

public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(ILogger<ChatHub> logger)
    {
        _logger = logger;
    }

    public async Task EnviarMensagem(string usuario, string mensagem)
    {
        _logger.LogInformation("Mensagem recebida de {Usuario}: {Mensagem}", usuario, mensagem);

        await Clients.All.SendAsync("sendMessage", usuario, mensagem);
    }
}
