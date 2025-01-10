import { Quiz } from '@common/interfaces/quiz';
import { Question } from '@common/interfaces/question';
import { expect } from 'chai';
import { GameQuizHandlerService } from './game-quiz-handler.service';

describe('GameQuizHandlerService', () => {
    let quizMock: Quiz;
    let gameQuizHandlerService: GameQuizHandlerService;

    beforeEach(() => {
        quizMock = {
            questions: [
                {
                    text: 'Question 1',
                    choices: [
                        { text: 'Choice 1', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                        { text: 'Choice 3', isCorrect: true },
                    ],
                    points: 10,
                } as Question,
                {
                    text: 'Question 2',
                    choices: [
                        { text: 'Choice 1', isCorrect: false },
                        { text: 'Choice 2', isCorrect: true },
                    ],
                    points: 20,
                } as Question,
            ],
        } as Quiz;

        gameQuizHandlerService = new GameQuizHandlerService(quizMock);
    });

    describe('goToNextQuestion', () => {
        it('should increment the question index', () => {
            gameQuizHandlerService.goToNextQuestion();
            expect(gameQuizHandlerService['questionIndex']).to.equal(1);
        });
    });

    describe('isQuizFinished', () => {
        it('should return false if there are remaining questions', () => {
            expect(gameQuizHandlerService.isQuizFinished()).to.equal(false);
        });

        it('should return true if all questions have been answered', () => {
            gameQuizHandlerService['questionIndex'] = quizMock.questions.length;
            expect(gameQuizHandlerService.isQuizFinished()).to.equal(true);
        });
    });

    it('should return the current question', () => {
        const question = gameQuizHandlerService.getQuestion();
        expect(question).to.deep.equal({ ...quizMock.questions[0], index: 0 });
    });

    it('should return undefined if all questions have been answered', () => {
        gameQuizHandlerService['questionIndex'] = quizMock.questions.length;

        const question = gameQuizHandlerService.getQuestion();
        expect(question).to.equal(undefined);
    });
});
