using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace API.Hubs;

public class ChatHub : Hub
{
    // Usuários reais (vindos de chamadas do cliente)
    private static readonly ConcurrentDictionary<string, byte> _realUsers = new();
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(ILogger<ChatHub> logger)
    {
        _logger = logger;
    }

    // Exposto para o BackgroundService mesclar com os simulados.
    internal static ICollection<string> RealUsers => _realUsers.Keys;

    public async Task EnviarMensagem(string usuario, string mensagem)
    {
        _logger.LogInformation("Mensagem recebida de {Usuario}: {Mensagem}", usuario, mensagem);

        await Clients.All.SendAsync("sendMessage", usuario, mensagem);
    }

    // Notifica que um usuário entrou (incremental real)
    public async Task PublicarUsuarioOnline(string usuario)
    {
        // Se já existir como real, só reenvia notificação (mantém)
        if (_realUsers.TryAdd(usuario, 0))
        {
            _logger.LogInformation("Usuário REAL online: {Usuario}", usuario);
        }
        else
        {
            _logger.LogInformation("Usuário REAL já estava online: {Usuario}", usuario);
        }

        // Evento incremental específico de usuário real (pode reutilizar userOnline se não quiser distinguir)
        await Clients.All.SendAsync("userOnline", usuario);

        // Envia snapshot mesclado (reais + simulados serão unidos pelo BackgroundService nos próximos ciclos).
        // Aqui apenas envia a parte real para evitar sobreescrever a lista simulada incorretamente.
        await Clients.All.SendAsync("usersOnlineRealPartial", RealUsers.ToArray());
    }

    // Notifica saída de usuário real
    public async Task PublicarUsuarioOffline(string usuario)
    {
        if (_realUsers.TryRemove(usuario, out _))
        {
            _logger.LogInformation("Usuário REAL offline: {Usuario}", usuario);
            await Clients.All.SendAsync("userOffline", usuario);
        }
    }

    // Snapshot apenas dos reais (o BackgroundService envia o merged)
    public Task EnviarListaUsuariosReais()
    {
        var lista = RealUsers.ToArray();
        return Clients.All.SendAsync("usersOnlineRealPartial", lista);
    }

    // Cliente pode solicitar apenas a parte real; a lista completa virá do serviço de simulação.
    public Task SolicitarSnapshotReais()
    {
        return EnviarListaUsuariosReais();
    }
}
