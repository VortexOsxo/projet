import { Player } from '@app/interfaces/users/player';
import { GameSessionBase } from './game-session-base';
import { KickedOutMessage } from '@app/enums/kicked-out-message';

export class GameSessionMultiplayer extends GameSessionBase {
    setUp() {
        super.setUp();
        this.showLoading();
    }

    setPlayers(players: Player[]) {
        this.players = players;
        this.removePlayersWithoutName();
    }

    protected findPlayersWithoutName(): Player[] {
        return this.players.filter((player) => !player.name.trim());
    }

    protected removePlayersWithoutName(): void {
        this.findPlayersWithoutName().forEach((player) => this.removePlayer(player, KickedOutMessage.GameAlreadyStarted));
    }
}
