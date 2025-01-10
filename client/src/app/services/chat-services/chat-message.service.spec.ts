import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '@common/interfaces/chat/chat-message';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { ChatMessageService } from './chat-message.service';
import { ChatService } from './chat.service';
import { EventEmitter } from '@angular/core';
import { ChatSocketEvent } from '@common/enums/socket-event/chat-socket-event';

describe('ChatMessageService', () => {
    let service: ChatMessageService;

    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on', 'emit']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        chatServiceSpy = jasmine.createSpyObj('ChatService', ['leaveChat']);
        chatServiceSpy.username = 'mockUsername';
        chatServiceSpy.leftChatEvent = new EventEmitter();

        TestBed.configureTestingModule({
            providers: [
                ChatService,
                { provide: SocketFactoryService, useValue: socketFactoryServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
            ],
            imports: [FormsModule],
        });

        service = TestBed.inject(ChatMessageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('leave chat messages should reset the messages', () => {
        service['messagesSubject'].next([{ content: 'hello' } as ChatMessage]);
        service['leaveChat']();

        expect(service['messagesSubject'].value).toEqual([]);
        expect(service['chatMessages']).toEqual([]);
    });

    it('should return an observable that emits messages from messagesSubject', () => {
        const testMessages: ChatMessage[] = [
            { user: 'user1', content: 'message1', time: new Date() },
            { user: 'user2', content: 'message2', time: new Date() },
        ];

        let emittedMessages: ChatMessage[] = [];
        service.getMessagesObservable().subscribe((messages) => {
            emittedMessages = messages;
        });

        service['messagesSubject'].next(testMessages);

        expect(emittedMessages).toEqual(testMessages);
    });

    it('should send message when sendMessage is called', () => {
        service.sendMessage('test message');
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(
            ChatSocketEvent.PostMessage,
            jasmine.objectContaining({ user: chatServiceSpy.username, content: 'test message' }),
        );
    });

    it('should not send empty message when sendMessage is called', () => {
        service.sendMessage('');
        expect(socketServiceSpy.emit).not.toHaveBeenCalled();
    });

    it('should leave chat when leaveChat is called', () => {
        service['leaveChat']();

        service.getMessagesObservable().subscribe((messages) => {
            expect(messages).toEqual([]);
        });
    });

    it('should update messages when receiving new message from socket', () => {
        const expectedMessage: ChatMessage = { user: 'testUser', content: 'test message', time: new Date() };

        expect(socketServiceSpy.on).toHaveBeenCalledWith(ChatSocketEvent.GetMessage, jasmine.any(Function));

        const callback = socketServiceSpy.on.calls.argsFor(0)[1] as (message: ChatMessage) => void;
        callback(expectedMessage);

        const lastIndex = service['chatMessages'].length - 1;
        expect(service['chatMessages'][lastIndex]).toEqual(expectedMessage);
    });

    it('should update messages when receiving a user leave the chat', () => {
        const username = 'salut';

        expect(socketServiceSpy.on).toHaveBeenCalledWith(ChatSocketEvent.UserLeft, jasmine.any(Function));

        const callback = socketServiceSpy.on.calls.argsFor(1)[1] as (username: string) => void;
        callback(username);

        const lastIndex = service['chatMessages'].length - 1;
        expect(service['chatMessages'][lastIndex].user).toEqual('Système');
        expect(service['chatMessages'][lastIndex].content).toEqual(`${username} a quitté la partie`);
    });

    it('should call leave chat on leftChatEvent', () => {
        const leaveChatSpy = spyOn(service as unknown as { leaveChat: () => void }, 'leaveChat');

        chatServiceSpy.leftChatEvent.emit();

        expect(leaveChatSpy).toHaveBeenCalled();
    });
});
