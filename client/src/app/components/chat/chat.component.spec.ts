import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from './chat.component';
import { ChatBannedStateService } from '@app/services/chat-services/chat-banned-state.service';
import { ChatMessageService } from '@app/services/chat-services/chat-message.service';
import { GameInfoService } from '@app/services/game-services/game-info.service';
import { of } from 'rxjs';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let chatMessageService: jasmine.SpyObj<ChatMessageService>;
    let chatBannedStateService: jasmine.SpyObj<ChatBannedStateService>;
    let gameInfoService: jasmine.SpyObj<GameInfoService>;

    beforeEach(async () => {
        chatMessageService = jasmine.createSpyObj('ChatMessageService', ['getMessagesObservable', 'sendMessage']);
        chatMessageService.getMessagesObservable.and.returnValue(of([]));

        chatBannedStateService = jasmine.createSpyObj('ChatBannedStateService', ['getIsUserBannedObservable']);
        chatBannedStateService.getIsUserBannedObservable.and.returnValue(of(false));

        gameInfoService = jasmine.createSpyObj('GameInfoService', ['getUsernameObservable']);

        await TestBed.configureTestingModule({
            declarations: [ChatComponent],
            imports: [FormsModule],
            providers: [
                { provide: ChatMessageService, useValue: chatMessageService },
                { provide: ChatBannedStateService, useValue: chatBannedStateService },
                { provide: GameInfoService, useValue: gameInfoService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call sendMessage on chatMessageService when sendMessage is called', () => {
        const testMessage = 'Test message';
        component.newMessage = testMessage;
        component.sendMessage();
        expect(chatMessageService.sendMessage).toHaveBeenCalledWith(testMessage);
    });

    it('should unsubscribe from messagesSubscription on ngOnDestroy', () => {
        const unsubscribeSpy = spyOn(component['messagesSubscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should scroll to bottom on ngAfterViewChecked', () => {
        const scrollToBottomSpy = spyOn(component as unknown as { scrollToBottom: () => void }, 'scrollToBottom').and.callThrough();
        component.ngAfterViewChecked();
        expect(scrollToBottomSpy).toHaveBeenCalled();
    });
});
