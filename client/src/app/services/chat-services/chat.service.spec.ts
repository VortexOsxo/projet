import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ChatService } from './chat.service';
import { GameInfoService } from '@app/services/game-services/game-info.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { ChatSocketEvent } from '@common/enums/socket-event/chat-socket-event';

describe('ChatService', () => {
    let service: ChatService;
    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let gameInfoServiceMock: jasmine.SpyObj<GameInfoService>;

    const usernameBehaviorSubject = new BehaviorSubject('');
    const gameIdBehavioSubject = new BehaviorSubject(0);

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on', 'emit']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        gameInfoServiceMock = jasmine.createSpyObj('GameInfoService', ['getUsernameObservable', 'getGameIdObservable']);
        gameInfoServiceMock.getUsernameObservable.and.returnValue(usernameBehaviorSubject.asObservable());
        gameInfoServiceMock.getGameIdObservable.and.returnValue(gameIdBehavioSubject.asObservable());

        TestBed.configureTestingModule({
            providers: [
                ChatService,
                { provide: SocketFactoryService, useValue: socketFactoryServiceSpy },
                { provide: GameInfoService, useValue: gameInfoServiceMock },
            ],
            imports: [FormsModule],
        });

        service = TestBed.inject(ChatService);
        service.username = 'mockUsername';
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should ban user when banUser is called', () => {
        const testUsername = 'testUser';
        service.banUser(testUsername);
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(ChatSocketEvent.BanUser, testUsername);
    });

    it('should leave chat when leaveChat is called', () => {
        service.leaveChat();
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(ChatSocketEvent.LeaveChat);
    });

    it('should update username when needed', () => {
        const newUsername = 'new';
        const oldUsername = 'old';

        service.username = oldUsername;

        usernameBehaviorSubject.next(newUsername);

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(ChatSocketEvent.UpdateUsername, { newUsername, oldUsername });
    });

    it('should join the right chat when gameId is updated', () => {
        const newId = 123;
        gameIdBehavioSubject.next(newId);

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(ChatSocketEvent.LeaveChat, service.username);
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(ChatSocketEvent.JoinChat, { chatId: 123, username: service.username });
    });
});
