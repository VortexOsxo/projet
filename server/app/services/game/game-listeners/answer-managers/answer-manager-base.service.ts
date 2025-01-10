import { Player } from '@app/interfaces/users/player';
import { BaseGameObserver } from '@app/services/game/game-listeners/base-observer';
import { GameSessionBase } from '@app/classes/game/game-session-base';

export abstract class AnswerManagerBase extends BaseGameObserver {
    private correctionFinishedCallback: () => void;

    constructor(game: GameSessionBase) {
        super(game);
        this.resetAnswer();
        this.setUpPlayers();
    }

    setCorrectionFinishedCallback(callback: () => void) {
        this.correctionFinishedCallback = callback;
    }

    finalizeAnswerSubmissions() {
        this.finalizeAnswerSubmissionsIntern();
    }

    protected onCorrectionfinished() {
        this.resetAnswer();
        this.correctionFinishedCallback?.();
    }

    private setUpPlayers() {
        this.players.forEach((player) => this.setUpPlayerSocket(player));
    }

    protected abstract setUpPlayerSocket(player: Player): void;
    protected abstract clearPlayerSocket(player: Player): void;
    protected abstract finalizeAnswerSubmissionsIntern(): void;
    protected abstract resetAnswer(): void;
}
