import { Player } from '@app/interfaces/users/player';
import { ORGANIZER_USERNAME } from '@common/config/game-config';
import { GameSessionMultiplayer } from './game-session-multiplayer';

export class GameSessionRandom extends GameSessionMultiplayer {
    setPlayers(players: Player[]) {
        const organizerAsPlayer = this.organizer as Player;
        organizerAsPlayer.name = ORGANIZER_USERNAME;

        this.players = [...players, organizerAsPlayer];
        this.removePlayersWithoutName();
    }

    removePlayer(playerToRemove: Player, reason?: string): boolean {
        if (!super.removePlayer(playerToRemove, reason)) return false;
        if (this.areTherePlayerLeft()) return true;
        this.clearGame();
        return true;
    }

    correctionWasFinished(): void {
        super.correctionWasFinished();
        this.continueQuiz();
    }

    protected shouldGoToCorrectionState(): boolean {
        return false;
    }
}
