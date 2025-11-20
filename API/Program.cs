using API;
using API.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
        .WithOrigins("http://localhost:4200") // Substitua pela URL do cliente Angular
        .WithOrigins("http://localhost:60101") // Substitua pela URL do cliente Angular
        .WithOrigins("http://192.168.1.90:4200") // Substitua pela URL do cliente Angular
        .WithOrigins("https://192.168.1.80:4200/") // Substitua pela URL do cliente Angular
        .WithOrigins("http://192.168.1.80:4200/") // Substitua pela URL do cliente Angular
        .WithOrigins("http://192.168.1.80") // Substitua pela URL do cliente Angular
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Obrigatório para SignalR
    });
});

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSignalR();

builder.Services.AddHostedService<ChatBackgroundService>();

var app = builder.Build();

app.UseCors();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/chathub");

app.Run();
