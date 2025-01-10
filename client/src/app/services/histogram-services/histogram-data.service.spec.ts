import { TestBed } from '@angular/core/testing';
import { HistogramDataService } from './histogram-data.service';
import { AnswerStats } from '@common/interfaces/answers/answer-stats';
import { QuestionType } from '@common/enums/question-type';
import { QRL_COLORS, QRL_LEADERBOARD_LABELS, QRL_ORGANIZER_LABELS, RIGHT_ANSWER_COLOR, WRONG_ANSWER_COLOR } from '@app/consts/histogram.const';
import { GameInfoService } from '@app/services/game-services/game-info.service';
import { Question } from '@common/interfaces/question';
import { Quiz } from '@common/interfaces/quiz';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';

const answer: AnswerStats = {
    questionIndex: 0,
    barCounts: [0, 2, 1, 3],
};

describe('HistogramDataService', () => {
    let service: HistogramDataService;
    let gameInfoServiceSpy: jasmine.SpyObj<GameInfoService>;

    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        gameInfoServiceSpy = jasmine.createSpyObj(GameInfoService, ['getQuiz']);

        TestBed.configureTestingModule({
            providers: [
                { provide: GameInfoService, useValue: gameInfoServiceSpy },
                { provide: SocketFactoryService, useValue: socketFactoryServiceSpy },
            ],
        });
        service = TestBed.inject(HistogramDataService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be able to set question index', () => {
        const questionIndex = 3;
        service.setQuestionIndex(questionIndex);

        expect(service['questionIndex']).toEqual(questionIndex);
    });

    it('should initialize state correctly', () => {
        expect(service['submitedAnswers']).toBeInstanceOf(Map);
        expect(service['submitedAnswers'].size).toBe(0);
    });

    it('should add answer to map correctly', () => {
        service['addAnswerToMap'](answer);

        expect(service['submitedAnswers'].size).toBe(1);
        expect(service['submitedAnswers'].get(0)).toEqual(answer.barCounts);
    });

    it('should not add answer to map if questionIndex is undefined or null', () => {
        const answer1: AnswerStats = {
            questionIndex: 0,
            barCounts: [0, 1, 2],
        };

        service['addAnswerToMap'](answer1);
        service['addAnswerToMap'](answer);

        expect(service['submitedAnswers'].size).toBe(1);
    });

    it('should get specific question results correctly', () => {
        service['submitedAnswers'].set(1, [1, 2, 3]);

        service['questionIndex'] = 1;
        const result = service.getCurrentAsnwers();

        expect(result).toEqual([1, 2, 3]);
    });

    it('should return empty array if question results are not available', () => {
        service['questionIndex'] = 0;
        const result = service.getCurrentAsnwers();

        expect(result).toEqual([]);
    });

    it('should get labels correctly for QCM type question', () => {
        gameInfoServiceSpy.getQuiz.and.returnValue({
            questions: [
                {
                    type: QuestionType.QCM,
                    choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }, { text: 'Choice 3' }],
                },
            ],
        } as Quiz);

        const labels = service.getLabels();

        expect(labels).toEqual(['Choice 1', 'Choice 2', 'Choice 3']);
    });

    it('should use default labels for non-QCM type question', () => {
        gameInfoServiceSpy.getQuiz.and.returnValue({ questions: [{ type: QuestionType.QRL }] } as Quiz);
        service['questionIndex'] = 0;

        const labels = service.getLabels();

        expect(labels).toEqual(service['qrmLabels']);
    });

    it('should get bar colors correctly for QCM type question', () => {
        gameInfoServiceSpy.getQuiz.and.returnValue({
            questions: [
                {
                    type: QuestionType.QCM,
                    choices: [{ isCorrect: true }, { isCorrect: false }, { isCorrect: true }],
                },
            ],
        } as Quiz);
        service['questionIndex'] = 0;

        const colors = service.getBarColor();

        expect(colors).toEqual([RIGHT_ANSWER_COLOR, WRONG_ANSWER_COLOR, RIGHT_ANSWER_COLOR]);
    });

    it('should use default bar colors for non-QCM type question', () => {
        gameInfoServiceSpy.getQuiz.and.returnValue({ questions: [{ type: QuestionType.QRL }] } as Quiz);
        service['questionIndex'] = 0;

        const colors = service.getBarColor();

        expect(colors).toEqual(QRL_COLORS);
    });

    it('should emit answer event correctly', () => {
        spyOn(service.answerEmitter, 'emit');

        service['addAnswerToMap'](answer);

        expect(service.answerEmitter.emit).toHaveBeenCalledWith(0);
    });

    it('should set initial state with empty Map', () => {
        const initialState = service['submitedAnswers'];

        expect(initialState instanceof Map).toBe(true);
        expect(initialState.size).toBe(0);
    });

    it('should add answer to map when receiving a new answer through socket', () => {
        const answerStats: AnswerStats = {
            questionIndex: 1,
            barCounts: [1, 0, 1, 2],
        };
        const addAnswerSpy = spyOn(service as unknown as { addAnswerToMap: (answer: AnswerStats) => void }, 'addAnswerToMap').and.callThrough();

        service['setUpSocket']();
        socketServiceSpy.on.calls.argsFor(0)[1](answerStats);

        expect(addAnswerSpy).toHaveBeenCalledWith(answerStats);
    });

    it('should not add answer to map if questionIndex is undefined', () => {
        const answerUndefinedIndex: AnswerStats = {
            questionIndex: undefined as unknown as number,
            barCounts: [0, 1, 2],
        };

        service['addAnswerToMap'](answerUndefinedIndex);

        expect(service['submitedAnswers'].size).toBe(0);
    });

    it('should assign default answer when questionIndex does not exist in the map', () => {
        const questionIndex = 1;

        const answerTest: AnswerStats = {
            questionIndex,
            barCounts: [1, 1, 2, 0],
        };

        service['addAnswerToMap'](answerTest);

        expect(service['submitedAnswers'].get(questionIndex)).toEqual([1, 1, 2, 0]);
    });

    it('should return undefined if questionIndex does not exist in the map', () => {
        const questionIndex = 1;

        const answerTest: AnswerStats = {
            questionIndex: 2,
            barCounts: [0, 1, 2, 1],
        };

        service['addAnswerToMap'](answerTest);

        expect(service['submitedAnswers'].get(questionIndex)).toBeUndefined();
    });

    it('getQuestion should return the questionfrom the gameInfoService', () => {
        const mockQuestion: Question = { text: 'Question' } as Question;
        const mockQuiz: Quiz = { questions: [mockQuestion] } as Quiz;

        gameInfoServiceSpy.getQuiz.and.returnValue(mockQuiz);

        expect(service['question']).toEqual(mockQuestion);
    });

    it('should update QRMLabels when receiving SET_QRL_CHARTS_GAME event', () => {
        const callback = socketServiceSpy.on.calls.argsFor(1)[1] as () => void;
        callback();

        expect(service['qrmLabels']).toEqual(QRL_ORGANIZER_LABELS);
    });

    it('should update QRMLabels when receiving SET_QRL_CHARTS_LEADERBOARD event', () => {
        const callback = socketServiceSpy.on.calls.argsFor(2)[1] as () => void;
        callback();

        expect(service['qrmLabels']).toEqual(QRL_LEADERBOARD_LABELS);
    });
});
