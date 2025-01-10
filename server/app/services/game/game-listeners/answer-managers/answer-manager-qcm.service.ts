import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Player } from '@app/interfaces/users/player';
import { AnswerQCMCorrectorService } from '@app/services/game/answer/answer-qcm-corrector.service';
import { AnswerStatsQCMService } from '@app/services/game/answer/answer-stats-qcm.service';
import { PlayerState } from '@common/enums/user-answer-state';
import { Service } from 'typedi';
import { AnswerManagerBase } from './answer-manager-base.service';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

const NOT_FOUND_INDEX = -1;

@Service({ transient: true })
export class AnswerManagerQCM extends AnswerManagerBase {
    private playerSubmissions: Map<Player, number[]>;
    private playerWhoClaimedBonus: Player;

    constructor(
        game: GameSessionBase,
        private answerCorrector: AnswerQCMCorrectorService,
        private answerStats: AnswerStatsQCMService,
    ) {
        super(game);
    }

    toggleAnswerChoice(player: Player, choiceIndex: number) {
        if (!this.validateChoiceIndex(choiceIndex)) return;

        const currentSelection = this.updatePlayerSelection(player, choiceIndex);
        this.playerSubmissions.set(player, currentSelection);
        player.answerState = PlayerState.ANSWERING;
        this.game.playersModifiedSubject.next();
        this.answerStats.updateChoiceStats(this.playerSubmissions, this.question.index);
    }

    submitPlayerAnswer(player: Player) {
        this.playerWhoClaimedBonus ??= player;
    }

    protected setUpPlayerSocket(player: Player): void {
        player.onUserEvent(GameAnswerSocketEvent.ToggleAnswerChoices, (choiceIndex: number) => this.toggleAnswerChoice(player, choiceIndex - 1));
    }

    protected clearPlayerSocket(player: Player) {
        player?.removeEventListeners(GameAnswerSocketEvent.ToggleAnswerChoices);
    }

    protected setUpGameObserver(game: GameSessionBase): void {
        game.quizEndedSubject.subscribe(() => this.onQuizEnded());
        game.questionStartedSubject.subscribe(() => this.answerCorrector.setQuestion(this.question));
        game.removedGameSubject.subscribe(() => this.players.forEach((player) => this.clearPlayerSocket(player)));
        game.removedUserSubject.subscribe((userRemoved) => this.clearPlayerSocket(userRemoved.user as Player));
    }

    protected finalizeAnswerSubmissionsIntern() {
        this.players.forEach((player) => this.scorePlayerAnswer(player));

        this.onCorrectionfinished();
    }

    protected resetAnswer() {
        this.playerSubmissions = new Map();
        this.playerWhoClaimedBonus = undefined;
    }

    private validateChoiceIndex(choiceIndex: number) {
        return choiceIndex || choiceIndex === 0;
    }

    private updatePlayerSelection(player: Player, choiceIndex: number): number[] {
        let currentSelection = this.playerSubmissions.get(player);
        currentSelection ??= [];

        const currentIndex = currentSelection.indexOf(choiceIndex);
        if (currentIndex === NOT_FOUND_INDEX) currentSelection.push(choiceIndex);
        else currentSelection.splice(currentIndex, 1);

        return currentSelection;
    }

    private scorePlayerAnswer(player: Player) {
        const getBonus = this.doesPlayerGetbonus(player);
        const playerSubmission = this.playerSubmissions.get(player) ?? [];
        this.answerCorrector.scorePlayerAnswers(player, playerSubmission, getBonus);
    }

    private doesPlayerGetbonus(player: Player): boolean {
        return player === this.playerWhoClaimedBonus || (!this.playerWhoClaimedBonus && this.players.length === 1);
    }

    private onQuizEnded() {
        this.answerStats.sendStatsToPlayers();
    }
}
