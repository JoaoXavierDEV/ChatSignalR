import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalrService } from './services/signalr.service'
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,FormsModule,CommonModule],
  //templateUrl: './app.component.html',
  template: `
  <div>
    <h2>Chat</h2>
    <input [(ngModel)]="user" placeholder="User" />
    <input [(ngModel)]="message" placeholder="Message" />
    <button (click)="sendMessage()">Send</button>

    <ul>
      <li *ngFor="let msg of messages">
        {{msg.user}}: {{msg.message}}
      </li>
    </ul>
  </div>
`,
  styleUrl: './app.component.css'
})
export class AppComponent {
  user = '';
  message = '';
  messages: { user: string; message: string }[] = [];

  title = 'signalr-angular';

  constructor(
    private signalRService: SignalrService,){}

  ngOnInit() {
    this.signalRService.startConnection();
    this.signalRService.addReceiveMessageListener((user, message) => {
      this.messages.push({ user, message });
    });
  }

  sendMessage() {
    this.signalRService.sendMessage(this.user, this.message);
    this.message = '';
  }
}
