import { Service } from 'typedi';
import { BaseGameObserver } from './base-observer';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { GameHistoryService } from '@app/services/game/game-history.service';

@Service({ transient: true })
export class HistoryObserver extends BaseGameObserver {
    constructor(
        game: GameSessionBase,
        private gameHistoryService: GameHistoryService,
    ) {
        super(game);
    }

    protected setUpGameObserver(game: GameSessionBase): void {
        game.quizStartedSubject.subscribe(() => {
            this.registerToGameHistory();
        });

        game.quizEndedSubject.subscribe(() => {
            this.saveToGameHistory();
        });

        game.removedGameSubject.subscribe(() => {
            this.clearFromGameHistory();
        });
    }

    private registerToGameHistory() {
        this.gameHistoryService.registerToHistory(this.game);
    }

    private saveToGameHistory() {
        this.gameHistoryService.saveGameToHistory(this.game);
    }

    private clearFromGameHistory() {
        this.gameHistoryService.unregisterFromHistory(this.game);
    }
}
