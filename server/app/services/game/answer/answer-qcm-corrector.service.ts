import { Question } from '@common/interfaces/question';
import { Player } from '@app/interfaces/users/player';
import { Service } from 'typedi';
import { FIRST_ANSWER_BONUS } from '@app/consts/game.const';
import { getValidAnswers } from '@app/utils/question.utils';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

@Service({ transient: true })
export class AnswerQCMCorrectorService {
    private question: Question;

    setQuestion(question: Question) {
        this.question = question;
    }

    scorePlayerAnswers(player: Player, answerIndexes: number[], deserveBonus: boolean) {
        if (!this.validateAnswer(answerIndexes)) return this.sendCorrectionMessage(player, 0, false);

        const score = deserveBonus ? this.getPointsWithBonus() : this.getPointsWithoutBonus();

        this.sendCorrectionMessage(player, score, deserveBonus);
        this.updatePlayerState(player, score, deserveBonus);
    }

    private validateAnswer(answerIndexes: number[]): boolean {
        const validAnswers = getValidAnswers(this.question);

        if (answerIndexes.length !== validAnswers.length) return false;
        return this.compareAnswersArray(answerIndexes, validAnswers);
    }

    private compareAnswersArray(answerIndexes: number[], validAnswers: number[]): boolean {
        return answerIndexes.every((answerIndex) => validAnswers.includes(answerIndex));
    }

    private updatePlayerState(player: Player, scoreGained: number, gotBonus: boolean) {
        if (gotBonus) player.bonusCount++;
        player.score += scoreGained;
    }

    private getPointsWithoutBonus(): number {
        return this.question.points;
    }

    private getPointsWithBonus(): number {
        return this.getPointsWithoutBonus() * FIRST_ANSWER_BONUS;
    }

    private sendCorrectionMessage(player: Player, score: number, gotBonus: boolean) {
        const message = gotBonus ? `Vouz avez obtenue ${score} points grâce au bonus` : `Vouz avez obtenue ${score} points`;
        player.emitToUser(GameAnswerSocketEvent.SendCorrectionMessage, message);
    }
}
