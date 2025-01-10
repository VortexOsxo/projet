import { TestBed } from '@angular/core/testing';

import { GameLeavingService } from './game-leaving.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChatService } from '@app/services/chat-services/chat.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('GameLeavingService', () => {
    let service: GameLeavingService;
    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let chatServiceMock: jasmine.SpyObj<ChatService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on', 'emit']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        chatServiceMock = jasmine.createSpyObj('ChatService', ['leaveChat']);

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogSpy.open.and.callThrough();

        TestBed.configureTestingModule({
            providers: [
                { provide: SocketFactoryService, useValue: socketFactoryServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: ChatService, useValue: chatServiceMock },
            ],
            imports: [MatSnackBarModule],
        });
        service = TestBed.inject(GameLeavingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('function leaveGame should emit playerLeftGame', () => {
        const leaveGameEvent = 'playerLeftGame';
        service.leaveGame();
        expect(socketServiceSpy.emit).toHaveBeenCalledOnceWith(leaveGameEvent);
    });

    describe('listening to kickedOutFromGame event', () => {
        const mockReason = 'Organizer Closed the game';
        let callback: (reason: string) => void;
        beforeEach(() => {
            service['setUpSocket']();
            callback = socketServiceSpy.on.calls.argsFor(0)[1];
        });

        it('shoule navigate to /home', () => {
            const expectedRouterArgument = ['/home'];
            callback(mockReason);
            expect(routerSpy.navigate).toHaveBeenCalledOnceWith(expectedRouterArgument);
        });

        it('should open a modal to inform the player', () => {
            callback(mockReason);
            expect(matDialogSpy.open).toHaveBeenCalledOnceWith(jasmine.anything(), { data: mockReason });
        });

        it('should reset the chat messages', () => {
            callback(mockReason);
            expect(chatServiceMock.leaveChat).toHaveBeenCalled();
        });
    });
});
