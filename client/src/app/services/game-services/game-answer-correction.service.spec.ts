import { TestBed } from '@angular/core/testing';

import { GameAnswerCorrectionService } from './game-answer-correction.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { AnswerToCorrect } from '@common/interfaces/answers/answer-to-correct';
import { VOID_ANSWER_TO_CORRECT } from '@app/consts/question.consts';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

describe('GameLongAnswerCorrectionService', () => {
    let service: GameAnswerCorrectionService;
    let socketFactoryServiceMock: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceMock: jasmine.SpyObj<SocketService>;

    let mockAnswers: AnswerToCorrect[];

    beforeEach(() => {
        mockAnswers = [
            { playerName: 'player1', score: 0, answer: 'answer1' },
            { playerName: 'player2', score: 0, answer: 'answer2' },
            { playerName: 'player3', score: 0, answer: 'answer3' },
        ];

        socketServiceMock = jasmine.createSpyObj('SocketService', ['on', 'emit']);

        socketFactoryServiceMock = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceMock.getSocket.and.returnValue(socketServiceMock);

        TestBed.configureTestingModule({
            providers: [GameAnswerCorrectionService, { provide: SocketFactoryService, useValue: socketFactoryServiceMock }],
        });
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameAnswerCorrectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getAnswers', () => {
        it('should return the appropriate answer', () => {
            const mockIndex = 1;
            service['answerToCorrect'] = mockAnswers;
            service['currentAnswerIndex'] = mockIndex;

            expect(service.getAnswer()).toEqual(mockAnswers[mockIndex]);
        });

        it('should return void answer if it cant find one', () => {
            const mockIndex = 1;
            service['answerToCorrect'] = [];
            service['currentAnswerIndex'] = mockIndex;

            expect(service.getAnswer()).toEqual(VOID_ANSWER_TO_CORRECT);
        });
    });

    describe('scoreAnswer', () => {
        it('should update the score of the current answer and emit answerToCorrectUpdated', () => {
            const score = 10;
            const mockIndex = 1;
            service['answerToCorrect'] = mockAnswers;
            service['currentAnswerIndex'] = mockIndex;

            const emitSpy = spyOn(service.answerToCorrectUpdated, 'emit');

            service.scoreAnswer(score);

            expect(service['answerToCorrect'][mockIndex].score).toEqual(score);
            expect(emitSpy).toHaveBeenCalled();
        });

        it('should call nextAnswer after updating the score', () => {
            const score = 10;
            const mockIndex = 1;
            service['answerToCorrect'] = mockAnswers;
            service['currentAnswerIndex'] = mockIndex;

            const nextAnswerSpy = spyOn(service as unknown as { nextAnswer: () => void }, 'nextAnswer');

            service.scoreAnswer(score);

            expect(nextAnswerSpy).toHaveBeenCalled();
        });
    });

    describe('nextAnswer', () => {
        it('should emit answerToCorrectUpdated and send corrected answers via socket if at the end', () => {
            const mockIndex = 2;
            service['answerToCorrect'] = mockAnswers;
            service['currentAnswerIndex'] = mockIndex;

            service['nextAnswer']();

            expect(service['currentAnswerIndex']).toEqual(mockIndex + 1);
            expect(socketServiceMock.emit).toHaveBeenCalledWith(GameAnswerSocketEvent.SendAnswersCorrected, mockAnswers);
        });
    });

    it('should update question on socket event', () => {
        service['answerToCorrect'] = [];
        expect(socketServiceMock.on).toHaveBeenCalledWith(GameAnswerSocketEvent.SendAnswerToCorrect, jasmine.any(Function));

        const callback = socketServiceMock.on.calls.argsFor(0)[1] as (answersToCorrect: AnswerToCorrect[]) => void;
        callback(mockAnswers);

        expect(service['answerToCorrect']).toEqual(mockAnswers);
    });
});
