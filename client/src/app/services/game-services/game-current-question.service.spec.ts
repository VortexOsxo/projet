import { TestBed } from '@angular/core/testing';
import { GameCurrentQuestionService } from './game-current-question.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { Question } from '@common/interfaces/question';
import { NULL_QUESTION } from '@app/consts/game.consts';
import { SocketService } from '@app/services/socket-service/socket.service';

describe('GameCurrentQuestionService', () => {
    let service: GameCurrentQuestionService;
    let socketFactoryServiceMock: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceMock: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceMock = jasmine.createSpyObj('SocketService', ['on']);

        socketFactoryServiceMock = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceMock.getSocket.and.returnValue(socketServiceMock);

        TestBed.configureTestingModule({
            providers: [GameCurrentQuestionService, { provide: SocketFactoryService, useValue: socketFactoryServiceMock }],
        });
        service = TestBed.inject(GameCurrentQuestionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with NULL_QUESTION', () => {
        expect(service.getCurrentQuestion()).toEqual(NULL_QUESTION);
    });

    it('should update the question when receiving the questionData event', () => {
        const mockQuestion: Question = { id: '1', text: 'Mock Question' } as Question;
        service['setUpSocket']();

        expect(socketServiceMock.on).toHaveBeenCalledWith('questionData', jasmine.any(Function));

        const callback = socketServiceMock.on.calls.mostRecent().args[1];
        callback(mockQuestion);

        expect(service['question']).toEqual(mockQuestion);
        expect(service.getCurrentQuestion()).toEqual(mockQuestion);
    });
});
