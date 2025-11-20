import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal } from '@angular/core';
import { SignalrService } from '../../services/signalr.service';

interface Toast {
  id: number;
  title: string;
  message: string;
}

@Component({
  selector: 'app-chat-online',
  standalone: true,
  templateUrl: './chat-online.html',
  styleUrl: './chat-online.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatOnline implements OnInit, OnDestroy {
  toasts = signal<Toast[]>([]);

  // Handler específico para o evento 'userOnline'
  private handlerUserOnline = (user: string) => this.onUserOnline(user);

  constructor(private signalR: SignalrService) {}

  ngOnInit(): void {
    // Escuta apenas eventos unitários de entrada
    this.signalR.addUserOnlineListener(this.handlerUserOnline);
  }

  ngOnDestroy(): void {
    this.signalR.removeUserOnlineListener(this.handlerUserOnline);
  }

  // Dispara toast para cada usuário que ficou online
  private onUserOnline(user: string) {
    this.pushToast({ title: 'Usuário online', message: `${user} está online` });
  }

  private pushToast(t: Omit<Toast, 'id'>) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    this.toasts.update(list => [...list, { id, ...t }]);
    setTimeout(() => {
      this.toasts.update(list => list.filter(x => x.id !== id));
    }, 4000);
  }
}
