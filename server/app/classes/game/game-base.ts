import { Player } from '@app/interfaces/users/player';
import { GameConfig } from '@app/interfaces/game-config';
import { Quiz } from '@common/interfaces/quiz';
import { User } from '@app/interfaces/users/user';
import { Subject } from 'rxjs';
import { UserRemoved } from '@app/interfaces/users/user-removed';
import { UserGameState } from '@common/enums/user-game-state';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';
import { KickedOutMessage } from '@app/enums/kicked-out-message';

export class GameBase {
    removedGameSubject: Subject<void>;
    removedUserSubject: Subject<UserRemoved>;

    organizer: User;
    players: Player[];
    gameId: number;
    quiz: Quiz;

    constructor(config: GameConfig) {
        this.organizer = config.organizer;
        this.gameId = config.gameId;
        this.quiz = config.quiz;
        this.players = [];

        this.removedGameSubject = new Subject();
        this.removedUserSubject = new Subject();
    }

    get users(): User[] {
        return [this.organizer, ...this.players].filter((user) => user);
    }

    getGameConfig(): GameConfig {
        return { gameId: this.gameId, organizer: this.organizer, quiz: this.quiz };
    }

    removePlayer(playerToRemove: Player, reason?: string): boolean {
        return this.removePlayerIntern(playerToRemove, reason);
    }

    removeOrganizer() {
        this.players.forEach((player) => this.removePlayerIntern(player, KickedOutMessage.OrganizerLeft));
        this.removeOrganizerIntern();
        this.clearGame();
        this.organizer = undefined;
    }

    protected findPlayerByName(playerName: string) {
        return this.players.find((player) => player.name === playerName);
    }

    protected areTherePlayerLeft() {
        return !!this.players.length;
    }

    protected updateUsersState(state: UserGameState) {
        this.users.forEach((user) => this.updateUserState(user, state));
    }

    protected updateUserState(user: User, state: UserGameState) {
        user.emitToUser(GamePlaySocketEvent.UpdateGameState, state);
    }

    protected clearGame() {
        this.removedGameSubject.next();
    }

    protected removeOrganizerIntern(reason?: string) {
        this.removedUserSubject.next({ user: this.organizer, reason: reason ?? KickedOutMessage.EmptyMessage });
    }

    private removePlayerIntern(playerToRemove: Player, reason?: string) {
        const removedPlayer = this.findPlayerByName(playerToRemove.name);
        if (!removedPlayer) return false;
        this.players = this.players.filter((player) => player.name !== playerToRemove.name);
        this.removedUserSubject.next({ user: playerToRemove, reason: reason ?? KickedOutMessage.EmptyMessage });
        return true;
    }
}
