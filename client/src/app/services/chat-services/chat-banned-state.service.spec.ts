import { TestBed } from '@angular/core/testing';
import { ChatBannedStateService } from './chat-banned-state.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { ChatService } from './chat.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { EventEmitter } from '@angular/core';
import { ChatSocketEvent } from '@common/enums/socket-event/chat-socket-event';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogModalService } from '@app/services/dialog-modal.service';

describe('ChatBannedStateService', () => {
    let service: ChatBannedStateService;

    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let dialogModalServiceSpy: jasmine.SpyObj<DialogModalService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        chatServiceSpy = jasmine.createSpyObj('ChatService', ['leftChatEvent']);
        chatServiceSpy.leftChatEvent = new EventEmitter();

        dialogModalServiceSpy = jasmine.createSpyObj('DialogModalService', ['openSnackBar']);

        TestBed.configureTestingModule({
            providers: [
                ChatBannedStateService,
                { provide: SocketFactoryService, useValue: socketFactoryServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
                { procide: DialogModalService, useValue: dialogModalServiceSpy },
            ],
            imports: [MatDialogModule, MatSnackBarModule, BrowserAnimationsModule],
        });

        service = TestBed.inject(ChatBannedStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize isUserBanned subject with false', () => {
        service.getIsUserBannedObservable().subscribe((isUserBanned) => {
            expect(isUserBanned).toBeFalse();
        });
    });

    it('should reset state to false when leftChatEvent is triggered', () => {
        service.getIsUserBannedObservable().subscribe((isUserBanned) => {
            expect(isUserBanned).toBeFalse();
        });

        chatServiceSpy.leftChatEvent.emit();

        service.getIsUserBannedObservable().subscribe((isUserBanned) => {
            expect(isUserBanned).toBeFalse();
        });
    });

    it('should update state on socket event', () => {
        expect(socketServiceSpy.on).toHaveBeenCalledWith(ChatSocketEvent.OnUserBanned, jasmine.any(Function));

        const callback = socketServiceSpy.on.calls.argsFor(0)[1] as (isBanned: boolean) => void;
        callback(true);

        service.getIsUserBannedObservable().subscribe((isUserBanned) => {
            expect(isUserBanned).toBeTrue();
        });
    });

    it('should open the proper snackbar', () => {
        service['modalService'] = dialogModalServiceSpy;

        service['sendBannedStateMessage'](true);
        expect(dialogModalServiceSpy.openSnackBar).toHaveBeenCalledWith("L'organisateur a retiré votre droit d'utiliser le chat.");

        service['sendBannedStateMessage'](false);
        expect(dialogModalServiceSpy.openSnackBar).toHaveBeenCalledWith("L'organisateur a alloué votre droit d'utiliser le chat.");
    });
});
