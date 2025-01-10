import { expect } from 'chai';
import { AnswerStatsQRLService } from './answer-stats-qrl.service';
import { User } from '@app/interfaces/users/user';
import { AnswerToCorrect } from '@common/interfaces/answers/answer-to-correct';
import { AnswerStats } from '@common/interfaces/answers/answer-stats';
import { SinonStubbedInstance, createStubInstance, match } from 'sinon';
import { Client } from '@app/classes/client';
import { GameChartSocketEvent } from '@common/enums/socket-event/game-charts-socket-event';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

describe('AnswerStatsQRLService', () => {
    let answerStatsService: AnswerStatsQRLService;
    let userMock: SinonStubbedInstance<User>;

    beforeEach(() => {
        answerStatsService = new AnswerStatsQRLService();
        userMock = createStubInstance(Client);
    });

    describe('addCorrectedAnswer', () => {
        it('should add corrected answer to the list', () => {
            const correctedAnswers: AnswerToCorrect[] = [
                { score: 1 },
                { score: 0.5 },
                { score: 0 },
                { score: 0.5 },
                { score: 1 },
            ] as AnswerToCorrect[];
            const questionIndex = 0;

            answerStatsService.addCorrectedAnswer(correctedAnswers, questionIndex);

            expect(answerStatsService['answerCorrectionResults'].length).to.equal(1);

            const answerStats: AnswerStats = answerStatsService['answerCorrectionResults'][0];
            expect(answerStats.questionIndex).to.equal(questionIndex);
            expect(answerStats.barCounts).to.deep.equal([2, 2, 1]);
        });
    });

    describe('sendStatsToUser', () => {
        it('should send answer stats to users', () => {
            const correctedAnswers: AnswerToCorrect[] = [{ score: 1 }] as AnswerToCorrect[];
            const questionIndex = 0;

            answerStatsService.addCorrectedAnswer(correctedAnswers, questionIndex);
            answerStatsService.sendStatsToUser([userMock]);

            expect(userMock.emitToUser.calledWithExactly(GameChartSocketEvent.SetQrlChartsLeaderboard)).to.equal(true);
            expect(userMock.emitToUser.calledWithExactly(GameAnswerSocketEvent.SendAnswerStats, match.any)).to.equal(true);
        });
    });
});
