import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection: signalR.HubConnection = {} as signalR.HubConnection;

  constructor() { }


  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5181/chathub') // URL do Hub
      .withUrl('https://localhost:7124/chathub') // URL do Hub
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public addReceiveMessageListener(callback: (user: string, message: string) => void) {
    this.hubConnection.on('sendMessage', callback);
  }

  public sendMessage(user: string, message: string) {
    console.log(`user: ${user}.  Message: ${message}`)
    this.hubConnection.invoke('EnviarMensagem', user, message)
      .catch(err => console.error(err));
  }
}
