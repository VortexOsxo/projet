import { AfterViewChecked, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ChatMessage } from '@common/interfaces/chat/chat-message';
import { GameInfoService } from '@app/services/game-services/game-info.service';
import { Observable, Subscription } from 'rxjs';
import { ChatBannedStateService } from '@app/services/chat-services/chat-banned-state.service';
import { ChatMessageService } from '@app/services/chat-services/chat-message.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements AfterViewChecked, OnDestroy {
    @ViewChild('scrollContainer') private scrollContainer: ElementRef;
    messages: ChatMessage[];

    newMessage: string = '';
    isBannedObservable: Observable<boolean>;
    private messagesSubscription: Subscription;

    constructor(
        private chatMessageService: ChatMessageService,
        private chatBannedState: ChatBannedStateService,
        private gameInfoService: GameInfoService,
    ) {
        this.messagesSubscription = this.chatMessageService
            .getMessagesObservable()
            .subscribe((messages: ChatMessage[]) => (this.messages = messages));
        this.isBannedObservable = this.chatBannedState.getIsUserBannedObservable();
    }

    get usernameObservable() {
        return this.gameInfoService.getUsernameObservable();
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    sendMessage() {
        this.chatMessageService.sendMessage(this.newMessage);
        this.newMessage = '';
    }

    ngOnDestroy() {
        if (this.messagesSubscription) this.messagesSubscription.unsubscribe();
    }

    private scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) {
            // no need to do anything on error
        }
    }
}
