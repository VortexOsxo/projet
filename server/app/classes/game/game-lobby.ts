import { Player } from '@app/interfaces/users/player';
import { GameBase } from './game-base';
import { Response } from '@common/interfaces/response';
import { createSuccessfulResponse, createUnsuccessfulResponse } from '@app/utils/responses.utils';
import { GameUsernameManager } from '@app/services/game/game-username-manager.service';
import { GameConfig } from '@app/interfaces/game-config';
import { Subject } from 'rxjs';
import { GameSessionBase } from './game-session-base';
import { UserGameState } from '@common/enums/user-game-state';
import { User } from '@app/interfaces/users/user';
import { GameInfo } from '@common/interfaces/game-info';
import { translatePlayers } from '@app/utils/translate.utils';
import { GameType } from '@common/enums/game-type';
import { KickedOutMessage } from '@app/enums/kicked-out-message';
import { GameResponse } from '@app/enums/game-response';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';

export class GameLobby extends GameBase {
    gameStartedSubject: Subject<GameSessionBase>;
    addedPlayerSubject: Subject<Player>;
    futureGameType: GameType;
    private isLocked: boolean;

    constructor(
        private gameUsernameManager: GameUsernameManager,
        config: GameConfig,
    ) {
        super(config);
        this.futureGameType = config.futureGameType;
        this.initializeUser(this.organizer);
        this.isLocked = false;
        this.gameStartedSubject = new Subject();
        this.addedPlayerSubject = new Subject();
    }

    canStartGame(): boolean {
        return this.futureGameType === GameType.NormalGame ? this.canStartNormalGame() : this.canStartRandomGame();
    }

    gameStarted(game: GameSessionBase) {
        this.gameStartedSubject.next(game);
    }

    toggleLock(): boolean {
        this.isLocked = !this.isLocked;
        return this.isLocked;
    }

    setUsername(player: Player, username: string): Response {
        if (!this.gameUsernameManager.attemptSetUsername(player, username)) return createUnsuccessfulResponse(GameResponse.UsernameUnavailable);

        this.onPlayerNamed(player);
        player.emitToUser(GamePlayerSocketEvent.SendPlayerStats, translatePlayers(this.players));

        return createSuccessfulResponse();
    }

    addPlayer(player: Player): Response {
        if (this.isLocked) return createUnsuccessfulResponse(GameResponse.LobbyLocked);
        this.players.push(player);
        this.initializeUser(player);
        return createSuccessfulResponse();
    }

    removePlayer(playerToRemove: Player, reason?: string): boolean {
        if (!super.removePlayer(playerToRemove, reason)) return false;
        this.gameUsernameManager.removeBannedUsername(playerToRemove.name);
        return true;
    }

    banPlayer(playerName: string) {
        const playerToBan = this.findPlayerByName(playerName);
        if (!playerToBan) return;

        this.removePlayer(playerToBan, KickedOutMessage.BannedFromGame);
        this.gameUsernameManager.addBannedUsername(playerName);
    }

    private canStartRandomGame() {
        return this.isLocked;
    }

    private canStartNormalGame() {
        return this.isLocked && !!this.players.length;
    }

    private onPlayerNamed(playerNamed: Player) {
        this.addedPlayerSubject.next(playerNamed);
    }

    private initializeUser(user: User) {
        const gameInfo: GameInfo = {
            gameId: this.gameId,
            quizToPlay: this.quiz,
            gameType: this.futureGameType,
        };
        user.emitToUser(GamePlaySocketEvent.SendGameInfo, gameInfo);
        this.updateUserState(user, UserGameState.InLobby);
    }
}
