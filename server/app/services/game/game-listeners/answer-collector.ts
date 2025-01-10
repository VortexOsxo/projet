import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Player } from '@app/interfaces/users/player';
import { translatePlayers } from '@app/utils/translate.utils';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';
import { QuestionType } from '@common/enums/question-type';
import { PlayerState } from '@common/enums/user-answer-state';
import { Service } from 'typedi';
import { AnswerManagerBase } from './answer-managers/answer-manager-base.service';
import { AnswerManagerQCM } from './answer-managers/answer-manager-qcm.service';
import { AnswerManagerQRL } from './answer-managers/answer-manager-qrl.service';
import { BaseGameObserver } from './base-observer';

@Service({ transient: true })
export class AnswerCollector extends BaseGameObserver {
    private playersWhichSubmited: Set<Player>;

    constructor(
        game: GameSessionBase,
        private answerManagerQRL: AnswerManagerQRL,
        private answerManagerQCM: AnswerManagerQCM,
    ) {
        super(game);
        this.initialize();
    }

    private get answerManager(): AnswerManagerBase {
        return this.question.type === QuestionType.QCM ? this.answerManagerQCM : this.answerManagerQRL;
    }

    protected setUpGameObserver(game: GameSessionBase): void {
        game.questionEndedSubject.subscribe(() => this.submitUnsubmitedAnswers());
        game.removedGameSubject.subscribe(() => this.players.forEach((player) => this.clearPlayerSocket(player)));
        game.removedUserSubject.subscribe((userRemoved) => this.clearPlayerSocket(userRemoved.user as Player));
    }

    private initialize() {
        this.resetAnswer();

        this.players.forEach((player) => this.initializePlayer(player));

        this.answerManagerQCM.setCorrectionFinishedCallback(this.onCorrectionFinished.bind(this));
        this.answerManagerQRL.setCorrectionFinishedCallback(this.onCorrectionFinished.bind(this));
    }

    private initializePlayer(player: Player) {
        player.onUserEvent(GameAnswerSocketEvent.SubmitAnswer, () => this.submitPlayerAnswer(player));
    }

    private clearPlayerSocket(player: Player) {
        player?.removeEventListeners(GameAnswerSocketEvent.SubmitAnswer);
    }

    private submitUnsubmitedAnswers() {
        const playerWhoHaveNotsubmited = this.players.filter((player) => !this.playersWhichSubmited.has(player));
        playerWhoHaveNotsubmited.forEach((player) => player.emitToUser(GameAnswerSocketEvent.AnswerCollected));

        this.answerManager.finalizeAnswerSubmissions();
    }

    private onCorrectionFinished() {
        this.game.correctionWasFinished();
        this.resetAnswer();

        this.informPlayerOfCorrection();
    }

    private informPlayerOfCorrection() {
        this.players.forEach((player) => player.emitToUser(GamePlayerSocketEvent.SendPlayerScore, player.score));
        this.organizer.emitToUser(GamePlayerSocketEvent.SendPlayerStats, translatePlayers(this.players));
        this.organizer.emitToUser(GameManagementSocketEvent.CanGoToNextQuestion);
    }

    private submitPlayerAnswer(player: Player) {
        if (!this.canPlayerSubmit(player)) return;
        player.answerState = PlayerState.ANSWERED;
        this.game.playersModifiedSubject.next();
        if (this.question.type === QuestionType.QCM) this.answerManagerQCM.submitPlayerAnswer(player);

        this.verifyIfIsLastAnswer();
    }

    private canPlayerSubmit(player: Player): boolean {
        if (this.playersWhichSubmited.has(player)) return false;
        this.playersWhichSubmited.add(player);
        player.emitToUser(GameAnswerSocketEvent.AnswerCollected);
        return true;
    }

    private resetAnswer() {
        this.playersWhichSubmited = new Set();
    }

    private verifyIfIsLastAnswer() {
        if (this.playersWhichSubmited.size === this.players.length) this.game.allPlayerHaveSubmited();
    }
}
