import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  // Não usar {} as HubConnection
  private hubConnection: signalR.HubConnection | null = null;

  constructor() {
    this.buildConnection();
  }

  private buildConnection() {
    if (this.hubConnection) return;
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalRBaseUrl}/chathub`)
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();
  }

  public startConnection() {
    this.buildConnection();
    if (!this.hubConnection) return;

    // Evita múltiplos starts
    const state = this.hubConnection.state;
    if (state === signalR.HubConnectionState.Connected ||
        state === signalR.HubConnectionState.Connecting ||
        state === signalR.HubConnectionState.Reconnecting) {
      return;
    }

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR conectado');
        this.attachWindowUnloadStop();
      })
      .catch(err => console.error('Erro ao conectar SignalR: ', err));
  }

  public addReceiveMessageListener(callback: (user: string, message: string) => void) {
    this.buildConnection();
    this.hubConnection?.on('sendMessage', callback);
  }

  public addReceiveUserOnline(callback: (atuais: unknown) => void){
    this.buildConnection();
    this.hubConnection?.on('usersOnline', callback);
  }

  public removeReceiveUserOnline(callback: (atuais: unknown) => void){
    this.hubConnection?.off('usersOnline', callback);
  }

  public publicarUsuarioOnline(user: string) {
    this.hubConnection?.invoke('PublicarUsuarioOnline', user)
      .catch(err => console.error('Erro invoke: ', err));
  }

  public sendMessage(user: string, message: string) {
    console.log(`user: ${user}. Message: ${message}`);
    this.hubConnection?.invoke('EnviarMensagem', user, message)
      .catch(err => console.error('Erro invoke: ', err));
  }

  public attachWindowUnloadStop() {
    window.addEventListener('beforeunload', () => {
      if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
        this.hubConnection.stop();
      }
    });
  }

  // Snapshot (lista completa)
  public addUsersOnlineSnapshotListener(cb: (users: string[]) => void) {
    this.buildConnection();
    this.hubConnection?.on('usersOnline', cb);
  }
  
  public removeUsersOnlineSnapshotListener(cb: (users: string[]) => void) {
    this.hubConnection?.off('usersOnline', cb);
  }

  // Evento incremental de entrada
  public addUserOnlineListener(cb: (user: string) => void) {
    this.buildConnection();
    this.hubConnection?.on('userOnline', cb);
  }
  public removeUserOnlineListener(cb: (user: string) => void) {
    this.hubConnection?.off('userOnline', cb);
  }

  // Evento incremental de saída
  public addUserOfflineListener(cb: (user: string) => void) {
    this.buildConnection();
    this.hubConnection?.on('userOffline', cb);
  }
  public removeUserOfflineListener(cb: (user: string) => void) {
    this.hubConnection?.off('userOffline', cb);
  }
}