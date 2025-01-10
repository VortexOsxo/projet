import { expect } from 'chai';
import { AnswerQCMCorrectorService } from './answer-qcm-corrector.service';
import { Question } from '@common/interfaces/question';
import { FIRST_ANSWER_BONUS } from '@app/consts/game.const';
import { createStubInstance } from 'sinon';
import { Client } from '@app/classes/client';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

describe('AnswerCorrectorService', () => {
    let answerCorrectorService: AnswerQCMCorrectorService;

    const questionMock: Question = {
        points: 10,
        choices: [
            { text: 'Choix1', isCorrect: true },
            { text: 'Choix2', isCorrect: false },
        ],
    } as Question;

    beforeEach(() => {
        answerCorrectorService = new AnswerQCMCorrectorService();
    });

    describe('scorePlayerAnswers', () => {
        it('should update player score without bonus if answers are incorrect', () => {
            const playerMock = createStubInstance(Client);
            playerMock.bonusCount = 0;
            playerMock.score = 0;
            const answerIndexes = [0, 1];
            const deserveBonus = true;

            answerCorrectorService.setQuestion(questionMock);

            answerCorrectorService.scorePlayerAnswers(playerMock, answerIndexes, deserveBonus);

            expect(playerMock.score).to.equal(0);
            expect(playerMock.bonusCount).to.equal(0);
            expect(playerMock.emitToUser.calledWith(GameAnswerSocketEvent.SendCorrectionMessage)).to.equal(true);
        });

        it('should update player score with bonus if answers are correct and bonus is deserved', () => {
            const playerMock = createStubInstance(Client);
            playerMock.bonusCount = 0;
            playerMock.score = 0;
            const answerIndexes = [0];
            const deserveBonus = true;

            answerCorrectorService.setQuestion(questionMock);

            answerCorrectorService.scorePlayerAnswers(playerMock, answerIndexes, deserveBonus);

            const expectedScore = questionMock.points * FIRST_ANSWER_BONUS;
            expect(playerMock.score).to.equal(expectedScore);
            expect(playerMock.bonusCount).to.equal(1);
            expect(playerMock.emitToUser.calledWith(GameAnswerSocketEvent.SendCorrectionMessage)).to.equal(true);
        });

        it('should update player score without bonus if answers are correct and no bonus is deserved', () => {
            const playerMock = createStubInstance(Client);
            playerMock.bonusCount = 0;
            playerMock.score = 0;
            const answerIndexes = [0];
            const deserveBonus = false;

            answerCorrectorService.setQuestion(questionMock);

            answerCorrectorService.scorePlayerAnswers(playerMock, answerIndexes, deserveBonus);

            const expectedScore = questionMock.points;
            expect(playerMock.score).to.equal(expectedScore);
            expect(playerMock.bonusCount).to.equal(0);
            expect(playerMock.emitToUser.calledWith(GameAnswerSocketEvent.SendCorrectionMessage)).to.equal(true);
        });
    });
});
