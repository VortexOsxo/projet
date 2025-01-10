import { TestBed } from '@angular/core/testing';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { ChatService } from './chat.service';
import { ChatBanManagerService } from './chat-ban-manager.service';
import { EventEmitter } from '@angular/core';
import { ChatSocketEvent } from '@common/enums/socket-event/chat-socket-event';

describe('ChatBanManagerService', () => {
    let service: ChatBanManagerService;

    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['emit']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        chatServiceSpy = jasmine.createSpyObj('ChatService', ['leaveChat']);
        chatServiceSpy.leftChatEvent = new EventEmitter();

        TestBed.configureTestingModule({
            providers: [
                ChatBanManagerService,
                { provide: SocketFactoryService, useValue: socketFactoryServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
            ],
        });

        service = TestBed.inject(ChatBanManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize banUserNames as an empty Set', () => {
        expect(service['banUserNames']).toBeDefined();
        expect(service['banUserNames'].size).toBe(0);
    });

    it('should not consider a user banned initially', () => {
        expect(service.isUserBanned('testUser')).toBeFalse();
    });

    it('should emit a ban user event', () => {
        service.banUser('testUser');
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(ChatSocketEvent.BanUser, 'testUser');
    });

    it('should update banUserNames when banning/unbanning a user', () => {
        service.banUser('testUser');
        expect(service.isUserBanned('testUser')).toBeTrue();

        service.banUser('testUser');
        expect(service.isUserBanned('testUser')).toBeFalse();
    });

    it('should reset state when leaving the chat', () => {
        service.banUser('testUser');
        expect(service.isUserBanned('testUser')).toBeTrue();

        chatServiceSpy.leftChatEvent.emit();
        expect(service.isUserBanned('testUser')).toBeFalse();
    });
});
