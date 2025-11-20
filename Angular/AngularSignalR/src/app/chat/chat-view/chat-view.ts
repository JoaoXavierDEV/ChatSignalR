import { SignalrService } from '../../services/signalr.service';
import { form, Field } from '@angular/forms/signals';
import { Component, signal, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { ChatOnline } from '../chat-online/chat-online';

@Component({
  selector: 'app-chat-view',
  standalone: true,
  imports: [Field, ChatOnline],
  templateUrl: './chat-view.html',
  styleUrl: './chat-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatView implements AfterViewInit {
  user = '';
  message = '';
  messages = signal<{ user: string; message: string }[]>([]);
  myForm = form(messageModel);

  title = 'signalr-angular';

  constructor(private signalRService: SignalrService) {}

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLElement>;

  ngOnInit() {
    this.signalRService.startConnection();
    this.signalRService.addReceiveMessageListener((user, message) => {
      this.messages.update(list => [...list, { user, message }]);
      queueMicrotask(() => this.scrollToBottom());
    });
  }

  ngAfterViewInit() {
    effect(() => {
      this.messages(); // reage a mudanças
      this.scrollToBottom();
    });
  }

  private scrollToBottom() {
    const el = this.messagesContainer?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight + 10;
  }

  sendMessage() {
    this.signalRService.sendMessage(this.myForm.user().value(), this.myForm.message().value());
    this.signalRService.publicarUsuarioOnline(this.myForm.user().value());
    // limpa somente o campo message do form (se necessário ajustar API do Field)
    this.myForm.message().value.set('');
  }
}

export interface message {
  user: string;
  message: string;
}

export const messageModel = signal<message>({
  user: '',
  message: '',
});
