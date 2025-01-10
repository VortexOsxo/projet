import { TestBed } from '@angular/core/testing';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { DialogModalService } from '@app/services/dialog-modal.service';
import { GameCorrectionMessageService } from './game-correction-message.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

describe('GameCorrectionMessageService', () => {
    let service: GameCorrectionMessageService;

    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let dialogModalServiceSpy: jasmine.SpyObj<DialogModalService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on']);
        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        dialogModalServiceSpy = jasmine.createSpyObj('DialogModalService', ['openSnackBar']);

        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        TestBed.configureTestingModule({
            providers: [
                GameCorrectionMessageService,
                { provide: SocketFactoryService, useValue: socketFactoryServiceSpy },
                { provide: DialogModalService, useValue: dialogModalServiceSpy },
            ],
        });

        service = TestBed.inject(GameCorrectionMessageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should open a snackbar when receiving a correction message', () => {
        const mockMessage = 'mock';
        service['setUpSocket']();

        expect(socketServiceSpy.on).toHaveBeenCalledWith(GameAnswerSocketEvent.SendCorrectionMessage, jasmine.any(Function));

        const callback = socketServiceSpy.on.calls.argsFor(0)[1] as (message: string) => void;
        callback(mockMessage);

        expect(dialogModalServiceSpy.openSnackBar).toHaveBeenCalledWith(mockMessage);
    });
});
