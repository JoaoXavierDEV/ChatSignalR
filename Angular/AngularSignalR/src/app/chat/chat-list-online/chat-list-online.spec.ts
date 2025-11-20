import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatListOnline } from './chat-list-online';

describe('ChatListOnline', () => {
  let component: ChatListOnline;
  let fixture: ComponentFixture<ChatListOnline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatListOnline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatListOnline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
