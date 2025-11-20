import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal } from '@angular/core';
import { SignalrService } from '../../services/signalr.service';

@Component({
  selector: 'app-chat-list-online',
  standalone: true,
  templateUrl: './chat-list-online.html',
  styleUrl: './chat-list-online.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListOnline implements OnInit, OnDestroy {

  users = signal<string[]>([]);

  private onSnapshot = (lista: string[]) => {
    this.users.set([...lista].sort((a,b) => a.localeCompare(b)));
  };

  private onUserOnline = (user: string) => {
    this.users.update(arr => {
      if (arr.includes(user)) return arr;
      return [...arr, user].sort((a,b) => a.localeCompare(b));
    });
  };

  private onUserOffline = (user: string) => {
    this.users.update(arr => arr.filter(u => u !== user));
  };

  constructor(private signalR: SignalrService) {}

  ngOnInit(): void {
    this.signalR.addUsersOnlineSnapshotListener(this.onSnapshot);
    this.signalR.addUserOnlineListener(this.onUserOnline);
    this.signalR.addUserOfflineListener(this.onUserOffline);
    // Solicitar snapshot inicial se necessário:
    // this.signalR.sendSnapshotRequest(); (implementar se quiser chamar método Hub)
  }

  ngOnDestroy(): void {
    this.signalR.removeUsersOnlineSnapshotListener(this.onSnapshot);
    this.signalR.removeUserOnlineListener(this.onUserOnline);
    this.signalR.removeUserOfflineListener(this.onUserOffline);
  }

  trackByUser(_i: number, user: string) { return user; }
}
