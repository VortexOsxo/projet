import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Player } from '@app/interfaces/users/player';
import { User } from '@app/interfaces/users/user';
import { AnswerStatsQRLService } from '@app/services/game/answer/answer-stats-qrl.service';
import { ActivePlayerService } from '@app/services/game/game-listeners/active-player.service';
import { QuestionType } from '@common/enums/question-type';
import { PlayerState } from '@common/enums/user-answer-state';
import { AnswerToCorrect } from '@common/interfaces/answers/answer-to-correct';
import { Question } from '@common/interfaces/question';
import { Service } from 'typedi';
import { AnswerManagerBase } from './answer-manager-base.service';
import { HUNDRED_PERCENT } from '@app/consts/game.const';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

@Service({ transient: true })
export class AnswerManagerQRL extends AnswerManagerBase {
    private playerSubmissions: Map<Player, string>;

    constructor(
        game: GameSessionBase,
        private activePlayerService: ActivePlayerService,
        private answerStatsQRLService: AnswerStatsQRLService,
    ) {
        super(game);
        this.initializeCorrector(this.organizer);
    }

    protected setUpPlayerSocket(player: Player): void {
        player.onUserEvent(GameAnswerSocketEvent.UpdateAnswerResponse, (updatedResponse: string) => this.updateResponse(player, updatedResponse));
    }

    protected clearPlayerSocket(player: Player): void {
        player?.removeEventListeners(GameAnswerSocketEvent.UpdateAnswerResponse);
    }

    protected setUpGameObserver(game: GameSessionBase): void {
        game.quizEndedSubject.subscribe(() => this.answerStatsQRLService.sendStatsToUser(this.users));
        game.questionStartedSubject.subscribe((question) => this.onQuestionStarted(question));
        game.questionEndedSubject.subscribe((question) => this.onQuestionEnded(question));
        game.removedGameSubject.subscribe(() => this.clearUsersSocket());
        game.removedUserSubject.subscribe((userRemoved) => this.clearPlayerSocket(userRemoved.user as Player));
    }

    protected finalizeAnswerSubmissionsIntern(): void {
        const answersToCorrect = this.getAnswersToCorrect(this.sortByPlayerName);
        if (answersToCorrect.length) this.organizer.emitToUser(GameAnswerSocketEvent.SendAnswerToCorrect, answersToCorrect);
        else this.onCorrectionfinished();
    }

    protected resetAnswer(): void {
        this.playerSubmissions = new Map();
    }

    private clearUsersSocket() {
        this.players.forEach((player) => this.clearPlayerSocket(player));
        this.organizer.removeEventListeners(GameAnswerSocketEvent.SendAnswersCorrected);
    }

    private updateResponse(player: Player, response: string) {
        player.answerState = PlayerState.ANSWERING;
        this.game.playersModifiedSubject.next();
        this.activePlayerService.onPlayerActivity(player);
        this.playerSubmissions.set(player, response);
    }

    private initializeCorrector(corrector: User) {
        corrector.onUserEvent(GameAnswerSocketEvent.SendAnswersCorrected, (correctedAnswers: AnswerToCorrect[]) =>
            this.receiveCorrectedAnswers(correctedAnswers),
        );
    }

    private onQuestionStarted(question: Question) {
        if (question.type === QuestionType.QRL) this.activePlayerService.initialize();
    }

    private onQuestionEnded(question: Question) {
        if (question.type === QuestionType.QRL) this.activePlayerService.clear();
    }

    private getAnswersToCorrect(sortFunction: (answers: AnswerToCorrect[]) => AnswerToCorrect[]) {
        const answersToCorrect: AnswerToCorrect[] = [];

        this.playerSubmissions.forEach((answer, player) => answersToCorrect.push(this.createAnswerToCorrect(answer, player)));
        return sortFunction(answersToCorrect);
    }

    private sortByPlayerName(answers: AnswerToCorrect[]) {
        return answers.sort((a, b) => a.playerName.localeCompare(b.playerName));
    }

    private receiveCorrectedAnswers(correctedAnswers: AnswerToCorrect[]) {
        correctedAnswers.forEach(this.scoreAnswer.bind(this));
        this.answerStatsQRLService.addCorrectedAnswer(correctedAnswers, this.question.index);

        this.onCorrectionfinished();
    }

    private scoreAnswer(correctedAnswer: AnswerToCorrect) {
        const players = Array.from(this.playerSubmissions.keys());

        const playerWhoSentRequest = players.find((player) => player.name === correctedAnswer.playerName);
        if (!playerWhoSentRequest) return;

        playerWhoSentRequest.score += this.question.points * correctedAnswer.score;
        this.sendCorrectionMessage(playerWhoSentRequest, correctedAnswer.score);
    }

    private sendCorrectionMessage(player: Player, score: number) {
        player.emitToUser(
            GameAnswerSocketEvent.SendCorrectionMessage,
            `Vouz avez obtenue ${score * HUNDRED_PERCENT}% soit ${this.question.points * score} points`,
        );
    }

    private createAnswerToCorrect(answer: string, player: Player) {
        return { playerName: player.name, answer, score: 0 };
    }
}
