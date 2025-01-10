import { TestBed } from '@angular/core/testing';
import { GameManagerService } from './game-manager.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { GameCurrentQuestionService } from './game-current-question.service';
import { Router } from '@angular/router';
import { SocketService } from '@app/services/socket-service/socket.service';
import { Question } from '@common/interfaces/question';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

describe('GameManagerService', () => {
    let service: GameManagerService;
    let socketFactoryServiceMock: jasmine.SpyObj<SocketFactoryService>;
    let gameCurrentQuestionServiceMock: jasmine.SpyObj<GameCurrentQuestionService>;
    let routerMock: jasmine.SpyObj<Router>;
    let socketServiceMock: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceMock = jasmine.createSpyObj('SocketService', ['on', 'emit']);

        socketFactoryServiceMock = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceMock.getSocket.and.returnValue(socketServiceMock);

        gameCurrentQuestionServiceMock = jasmine.createSpyObj('GameCurrentQuestionService', ['getCurrentQuestion']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                GameManagerService,
                { provide: SocketFactoryService, useValue: socketFactoryServiceMock },
                { provide: GameCurrentQuestionService, useValue: gameCurrentQuestionServiceMock },
                { provide: Router, useValue: routerMock },
            ],
        });
        service = TestBed.inject(GameManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with correct initial state', () => {
        expect(service.canSubmitAnswer()).toBeTrue();
    });

    it('should return the current question from the GameCurrentQuestionService', () => {
        const mockQuestion: Question = { id: '1', text: 'Mock Question' } as Question;
        gameCurrentQuestionServiceMock.getCurrentQuestion.and.returnValue(mockQuestion);

        expect(service.getCurrentQuestion()).toBe(mockQuestion);
    });

    it('should reset answered state when receiving questionData event', () => {
        service['setUpSocket']();

        const callback = socketServiceMock.on.calls.argsFor(0)[1];
        callback(null);

        expect(service.canSubmitAnswer()).toBeTrue();
    });

    it('should submit answers correctly', () => {
        service.submitAnswers();

        expect(service.canSubmitAnswer()).toBeFalse();
        expect(socketServiceMock.emit).toHaveBeenCalledWith(GameAnswerSocketEvent.SubmitAnswer);
    });

    it('should emit toggleAnswerChoice event with adjusted index', () => {
        const index = 2;
        const adjustedIndex = index + 1;

        service.toggleAnswerChoice(index);

        expect(socketServiceMock.emit).toHaveBeenCalledWith(GameAnswerSocketEvent.ToggleAnswerChoices, adjustedIndex);
    });

    it('should emit upadteAnswerResponse event with updated response', () => {
        const response = 'This is a response';

        service.updateAnswerResponse(response);

        expect(socketServiceMock.emit).toHaveBeenCalledWith(GameAnswerSocketEvent.UpdateAnswerResponse, response);
    });

    it('should handle score update event correctly', () => {
        const updatedScore = 100;
        service['setUpSocket']();

        const callback = socketServiceMock.on.calls.argsFor(1)[1];
        callback(updatedScore);

        let observedScoreValue = 0;
        service.getCurrentScoreObservable().subscribe((score) => {
            observedScoreValue = score;
        });
        expect(observedScoreValue).toEqual(updatedScore);
    });

    it('should navigate to game creation page when receiving finishedTestGame event', () => {
        service['setUpSocket']();

        const callback = socketServiceMock.on.calls.argsFor(2)[1];
        callback(null);

        expect(routerMock.navigate).toHaveBeenCalledWith(['/game-creation']);
    });

    it('should block submit when receiving collectedanswer event', () => {
        service['setUpSocket']();

        const callback = socketServiceMock.on.calls.argsFor(3)[1] as () => void;
        callback();

        expect(service['hasSubmitedAnswer']).toEqual(true);
    });
});
