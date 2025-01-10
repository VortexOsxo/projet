import { GameLobby } from './game-lobby';
import { Response } from '@common/interfaces/response';
import { GameUsernameManager } from '@app/services/game/game-username-manager.service';
import { GameConfig } from '@app/interfaces/game-config';
import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Client } from '@app/classes/client';
import { GameSessionBase } from './game-session-base';
import { GameType } from '@common/enums/game-type';
import { GameResponse } from '@app/enums/game-response';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';

describe('GameLobby', () => {
    let gameUsernameManagerMock: SinonStubbedInstance<GameUsernameManager>;

    let config: GameConfig;
    let gameLobby: GameLobby;
    let player: SinonStubbedInstance<Client>;
    let organizer: SinonStubbedInstance<Client>;

    beforeEach(() => {
        gameUsernameManagerMock = createStubInstance(GameUsernameManager);

        organizer = createStubInstance(Client);
        config = { gameId: 123, organizer, quiz: null };
        player = createStubInstance(Client);
        player.name = 'mockName';

        gameLobby = new GameLobby(gameUsernameManagerMock, config);
    });

    it('should return false when the lobby is not locked for a normal game', () => {
        gameLobby.futureGameType = GameType.NormalGame;
        gameLobby.addPlayer(createStubInstance(Client));

        expect(gameLobby.canStartGame()).to.equal(false);
    });

    it('should return false when the lobby is locked but there are no players for a normal game', () => {
        gameLobby.futureGameType = GameType.NormalGame;
        gameLobby.toggleLock();
        const canStart = gameLobby.canStartGame();
        expect(canStart).to.equal(false);
    });

    it('should return true when the lobby is locked and there are players for a normal game', () => {
        gameLobby.futureGameType = GameType.NormalGame;
        const playerTest = createStubInstance(Client);
        gameLobby.addPlayer(playerTest);
        gameLobby.toggleLock();
        expect(gameLobby.canStartGame()).to.equal(true);
    });

    it('should return false when the lobby is not locked for a random game', () => {
        gameLobby.futureGameType = GameType.RandomGame;

        expect(gameLobby.canStartGame()).to.equal(false);
    });

    it('should return true when the lobby is locked for a random game', () => {
        gameLobby.futureGameType = GameType.RandomGame;
        gameLobby.toggleLock();

        expect(gameLobby.canStartGame()).to.equal(true);
    });

    it('should add player to the lobby', () => {
        const response: Response = gameLobby.addPlayer(player);
        expect(gameLobby.players.length).to.equal(1);
        expect(response.success).to.equal(true);
    });

    it('should not add player to the locked lobby', () => {
        gameLobby.toggleLock();
        const response: Response = gameLobby.addPlayer(player);
        expect(gameLobby.players.length).to.equal(0);
        expect(response.success).to.equal(false);
        expect(response.message).to.equal(GameResponse.LobbyLocked);
    });

    it('should emit the game session when gameStarted is called', (done) => {
        const gameSessionMock = createStubInstance(GameSessionBase);

        gameLobby['gameStartedSubject'].subscribe((game) => {
            expect(game).to.equal(gameSessionMock);
            done();
        });

        gameLobby.gameStarted(gameSessionMock);
    });

    it('should ban a player and remove from lobby', () => {
        gameLobby.addPlayer(player);

        gameLobby.banPlayer(player.name);

        expect(gameLobby.players.length).to.equal(0);
        expect(gameUsernameManagerMock.addBannedUsername.calledOnceWithExactly(player.name)).to.equal(true);
    });

    it('should not call addBannedUsername when cant find the player', () => {
        gameLobby.banPlayer('playerName');

        expect(gameUsernameManagerMock.addBannedUsername.called).to.equal(false);
    });

    it('should not set username if unavailable', () => {
        const playerName = 'testPlayer';
        gameUsernameManagerMock.attemptSetUsername.returns(false);
        const response: Response = gameLobby.setUsername(player, playerName);
        expect(response.success).to.equal(false);
        expect(response.message).to.equal(GameResponse.UsernameUnavailable);
    });

    it('should set username successfully if username is available', () => {
        const playerName = 'testPlayer';
        gameUsernameManagerMock.attemptSetUsername.returns(true);

        const response: Response = gameLobby.setUsername(player, playerName);

        expect(response.success).to.equal(true);
        expect(gameUsernameManagerMock.attemptSetUsername.calledOnceWithExactly(player, playerName)).to.equal(true);
        expect(player.emitToUser.calledWithExactly(GamePlayerSocketEvent.SendPlayerStats, gameLobby.players)).to.equal(true);
    });

    it('should return unsuccessful response if username is unavailable', () => {
        const playerName = 'testPlayer';
        gameUsernameManagerMock.attemptSetUsername.returns(false);

        const response: Response = gameLobby.setUsername(player, playerName);

        expect(response.success).to.equal(false);
        expect(response.message).to.equal(GameResponse.UsernameUnavailable);
    });

    it('should remove player from the lobby', () => {
        gameLobby.addPlayer(player);
        const response: boolean = gameLobby.removePlayer(player);
        expect(response).to.equal(true);

        expect(gameLobby.players.length).to.equal(0);
        expect(gameUsernameManagerMock.removeBannedUsername.calledWith(player.name));
    });

    it('should not remove player if not found', () => {
        const response: boolean = gameLobby.removePlayer(player);
        expect(response).to.equal(false);
    });
});
