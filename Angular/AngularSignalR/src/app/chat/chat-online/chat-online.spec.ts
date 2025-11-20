import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatOnline } from './chat-online';

describe('ChatOnline', () => {
  let component: ChatOnline;
  let fixture: ComponentFixture<ChatOnline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatOnline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatOnline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
