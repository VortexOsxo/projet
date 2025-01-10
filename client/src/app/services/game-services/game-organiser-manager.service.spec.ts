import { TestBed } from '@angular/core/testing';
import { GameOrganiserManagerService } from './game-organiser-manager.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { GameInfoService } from './game-info.service';
import { BehaviorSubject, take } from 'rxjs';
import { SocketService } from '@app/services/socket-service/socket.service';
import { Quiz } from '@common/interfaces/quiz';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';

describe('GameOrganiserManagerService', () => {
    let service: GameOrganiserManagerService;
    let socketFactoryServiceMock: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceMock: jasmine.SpyObj<SocketService>;
    let gameInfoServiceMock: jasmine.SpyObj<GameInfoService>;

    const mockQuiz = {
        title: 'mockQuiz',
        questions: [{}, {}, {}],
    } as Quiz;

    beforeEach(() => {
        socketServiceMock = jasmine.createSpyObj('SocketService', ['on', 'emit']);

        socketFactoryServiceMock = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceMock.getSocket.and.returnValue(socketServiceMock);

        gameInfoServiceMock = jasmine.createSpyObj('GameInfoService', ['getQuiz']);
        gameInfoServiceMock.getQuiz.and.returnValue(mockQuiz);

        TestBed.configureTestingModule({
            providers: [
                GameOrganiserManagerService,
                { provide: SocketFactoryService, useValue: socketFactoryServiceMock },
                { provide: GameInfoService, useValue: gameInfoServiceMock },
            ],
        });
        service = TestBed.inject(GameOrganiserManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isNextQuestionButtonActive should return true if we can go to the next question', () => {
        service['canGoToNextQuestion'] = false;
        expect(service.isNextQuestionButtonActive()).toEqual(false);
        service['canGoToNextQuestion'] = true;
        expect(service.isNextQuestionButtonActive()).toEqual(true);
    });

    it('should emit event and update index when going to next question', () => {
        const expectedIndex = 0;
        service['currentQuestionIndex'] = new BehaviorSubject<number>(expectedIndex);
        spyOn(service['currentQuestionIndex'], 'next');
        spyOn(service.lastQuestionReached, 'emit');

        service.goToNextQuestion();

        expect(socketServiceMock.emit).toHaveBeenCalledWith('goToNextQuestion');
        expect(service['currentQuestionIndex'].next).toHaveBeenCalledWith(expectedIndex + 1);
        expect(service.lastQuestionReached.emit).not.toHaveBeenCalled();
    });

    it('should emit last question reached event when reaching the last question', () => {
        const expectedIndex = mockQuiz.questions.length - 2;
        service['currentQuestionIndex'] = new BehaviorSubject<number>(expectedIndex);
        spyOn(service.lastQuestionReached, 'emit');

        service.goToNextQuestion();

        expect(service.lastQuestionReached.emit).toHaveBeenCalled();
    });

    it('should return the number of questions from the quiz', () => {
        const expectedNumberOfQuestions = mockQuiz.questions.length;
        const result = service.getNumberQuestions();
        expect(result).toEqual(expectedNumberOfQuestions);
    });

    it('should return an observable of the current question index', () => {
        const expectedIndex = 42;
        service['currentQuestionIndex'] = new BehaviorSubject<number>(expectedIndex);

        const observable = service.getQuestionIndexObservable();

        observable.pipe(take(1)).subscribe((index) => {
            expect(index).toEqual(expectedIndex);
        });
    });

    it('should return the value of the question index', () => {
        const result = service.getQuestionIndex();
        expect(result).toEqual(service['currentQuestionIndex'].value);
    });

    it('should update can go to next question when receiving the right socket event', () => {
        expect(socketServiceMock.on).toHaveBeenCalledWith(GameManagementSocketEvent.CanGoToNextQuestion, jasmine.any(Function));

        const callback = socketServiceMock.on.calls.argsFor(0)[1] as () => void;
        callback();

        expect(service['canGoToNextQuestion']).toEqual(true);
    });
});
