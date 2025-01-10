import { expect } from 'chai';
import { stub, SinonStubbedInstance } from 'sinon';
import { DataManagerService } from '@app/services/data/data-manager.service';
import { GameRandomManagerService } from './game-random-manager.service';
import { Question } from '@common/interfaces/question';
import { Quiz } from '@common/interfaces/quiz';
import { QuestionType } from '@common/enums/question-type';
import { RANDOM_QUIZ_QUESTION_NUMBER } from '@common/config/game-config';
import { RANDOM_GAME_DESCRIPTION, RANDOM_GAME_DURATION, RANDOM_GAME_TITLE } from '@app/consts/random-game.consts';

const newDate = new Date();
const mockQuestions: Question[] = [
    { id: '1', text: 'Question 1', points: 1, type: QuestionType.QCM, choices: [], lastModification: newDate },
    { id: '2', text: 'Question 2', points: 1, type: QuestionType.QCM, choices: [], lastModification: newDate },
    { id: '3', text: 'Question 3', points: 1, type: QuestionType.QCM, choices: [], lastModification: newDate },
    { id: '4', text: 'Question 4', points: 1, type: QuestionType.QCM, choices: [], lastModification: newDate },
    { id: '5', text: 'Question 5', points: 1, type: QuestionType.QCM, choices: [], lastModification: newDate },
];

describe('GameRandomManagerService', () => {
    let dataManagerServiceStub: SinonStubbedInstance<DataManagerService<Question>>;
    let gameRandomManagerService: GameRandomManagerService;

    beforeEach(() => {
        dataManagerServiceStub = {} as SinonStubbedInstance<DataManagerService<Question>>;
        dataManagerServiceStub.setCollection = stub();
        dataManagerServiceStub.getElements = stub();
        gameRandomManagerService = new GameRandomManagerService(dataManagerServiceStub);
    });

    describe('createRandomQuiz', () => {
        it('should create a random quiz with 5 random QCM questions', async () => {
            dataManagerServiceStub.getElements.resolves(mockQuestions);
            const result = await gameRandomManagerService.createRandomQuiz();
            result.lastModification = newDate;
            expect(result.questions.length).to.equal(RANDOM_QUIZ_QUESTION_NUMBER);
            expect(result.questions.every((question) => question.type === QuestionType.QCM)).to.equal(true);
            expect(result).to.deep.equal({
                id: '0',
                title: RANDOM_GAME_TITLE,
                description: RANDOM_GAME_DESCRIPTION,
                duration: RANDOM_GAME_DURATION,
                lastModification: newDate,
                isVisible: true,
                questions: result.questions,
            } as Quiz);
        });
    });

    describe('getRandomQuestions', () => {
        it('should return 5 random QCM questions', async () => {
            const additionalMockQuestions: Question[] = [
                { id: '6', text: 'Question 6', points: 1, type: QuestionType.QCM, choices: [], lastModification: newDate },
                { id: '7', text: 'Question 7', points: 1, type: QuestionType.QRL, choices: [], lastModification: newDate },
            ];

            dataManagerServiceStub.getElements.resolves(mockQuestions.concat(additionalMockQuestions));
            const result = await gameRandomManagerService.getRandomQuestions();

            expect(result).to.have.lengthOf(RANDOM_QUIZ_QUESTION_NUMBER);
            expect(result.every((question: Question) => question.type === QuestionType.QCM)).to.equal(true);
        });
    });
});
