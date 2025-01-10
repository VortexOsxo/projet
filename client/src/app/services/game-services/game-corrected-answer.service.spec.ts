import { TestBed } from '@angular/core/testing';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { GameCorrectedAnswerService } from './game-corrected-answer.service';

describe('GameCorrectedAnswerService', () => {
    let service: GameCorrectedAnswerService;
    let socketFactoryServiceMock: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceMock: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceMock = jasmine.createSpyObj('SocketService', ['on']);

        socketFactoryServiceMock = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceMock.getSocket.and.returnValue(socketServiceMock);

        TestBed.configureTestingModule({
            providers: [GameCorrectedAnswerService, { provide: SocketFactoryService, useValue: socketFactoryServiceMock }],
        });
        service = TestBed.inject(GameCorrectedAnswerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with correct initial state', () => {
        expect(service.shouldShowCorrectedAnswer()).toBeFalse();
        expect(service.isAnswerCorrected(0)).toBeFalse();
    });

    it('should reset state when receiving questionData event', () => {
        service['showCorrectAnswer'] = true;
        service['correctAnswer'] = [1, 2, 3];
        service['setUpSocket']();

        const callback = socketServiceMock.on.calls.argsFor(0)[1];
        callback(null);

        expect(service.shouldShowCorrectedAnswer()).toBeFalse();
        expect(service.isAnswerCorrected(1)).toBeFalse();
        expect(service.isAnswerCorrected(2)).toBeFalse();
        expect(service.isAnswerCorrected(3)).toBeFalse();
    });

    it('should show correct answer when receiving correctAnswers event', () => {
        const mockAnswers: number[] = [1, 2, 3];
        service['setUpSocket']();

        const callback = socketServiceMock.on.calls.argsFor(1)[1];
        callback(mockAnswers);

        expect(service.shouldShowCorrectedAnswer()).toBeTrue();
        expect(service.isAnswerCorrected(1)).toBeTrue();
        expect(service.isAnswerCorrected(2)).toBeTrue();
        expect(service.isAnswerCorrected(3)).toBeTrue();
    });
});
