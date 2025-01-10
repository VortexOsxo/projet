import { QRL_SCORES } from '@app/consts/game.const';
import { User } from '@app/interfaces/users/user';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';
import { GameChartSocketEvent } from '@common/enums/socket-event/game-charts-socket-event';
import { AnswerStats } from '@common/interfaces/answers/answer-stats';
import { AnswerToCorrect } from '@common/interfaces/answers/answer-to-correct';
import { Service } from 'typedi';

@Service({ transient: true })
export class AnswerStatsQRLService {
    private answerCorrectionResults: AnswerStats[];

    constructor() {
        this.answerCorrectionResults = [];
    }

    addCorrectedAnswer(correctedAnswers: AnswerToCorrect[], questionIndex: number) {
        const answerStats: AnswerStats = { questionIndex, barCounts: this.getScoreCounts(correctedAnswers) };
        this.answerCorrectionResults.push(answerStats);
    }

    sendStatsToUser(users: User[]) {
        users.forEach((user) => user.emitToUser(GameChartSocketEvent.SetQrlChartsLeaderboard));
        this.answerCorrectionResults.forEach((answerStat) => {
            users.forEach((user) => user.emitToUser(GameAnswerSocketEvent.SendAnswerStats, answerStat));
        });
    }

    private getScoreCounts(correctedAnswers: AnswerToCorrect[]): number[] {
        const counts = [0, 0, 0];
        correctedAnswers.forEach((correctedAnswer) => ++counts[this.getIndexByScore(correctedAnswer.score)]);
        return counts;
    }

    private getIndexByScore(score: number) {
        return score === QRL_SCORES[0] ? 0 : score === QRL_SCORES[1] ? 1 : 2;
    }
}
