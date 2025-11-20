import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatView } from "./chat/chat-view/chat-view";
import { ChatListOnline } from './chat/chat-list-online/chat-list-online';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatView, ChatListOnline],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('appTeste');
}
