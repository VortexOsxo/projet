import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { GameManagerService } from '@app/services/game/game-manager.service';
import { ClientHandlerService } from '@app/services/client/client-handler.service';
import { GameOrganizerState } from './game-organizer-state.service';
import { Client } from '@app/classes/client';
import { GameLobby } from '@app/classes/game/game-lobby';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Player } from '@app/interfaces/users/player';
import { UserRemoved } from '@app/interfaces/users/user-removed';
import { Subject } from 'rxjs';
import { GameType } from '@common/enums/game-type';
import { ClientState } from '@app/enums/client-state';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';

describe('GameOrganizerState', () => {
    let mockGameManagerService: SinonStubbedInstance<GameManagerService>;
    let mockClientHandlerService: SinonStubbedInstance<ClientHandlerService>;

    let mockClient: SinonStubbedInstance<Client>;

    let mockGameLobby: SinonStubbedInstance<GameLobby>;
    let mockGameSession: SinonStubbedInstance<GameSessionBase>;

    let userRemovedSubjectMock: Subject<UserRemoved>;
    let addedPlayerSubjetMock: Subject<Player>;
    let gameStartedSubjectMock: Subject<GameSessionBase>;

    let gameOrganizerState: GameOrganizerState;

    beforeEach(() => {
        mockGameLobby = createStubInstance(GameLobby);
        mockGameSession = createStubInstance(GameSessionBase);

        userRemovedSubjectMock = new Subject<UserRemoved>();
        addedPlayerSubjetMock = new Subject<Player>();
        gameStartedSubjectMock = new Subject<GameSessionBase>();

        mockGameLobby.removedUserSubject = userRemovedSubjectMock;
        mockGameLobby.addedPlayerSubject = addedPlayerSubjetMock;
        mockGameLobby.gameStartedSubject = gameStartedSubjectMock;

        mockGameManagerService = createStubInstance(GameManagerService);
        mockClientHandlerService = createStubInstance(ClientHandlerService);
        mockClient = createStubInstance(Client);

        mockClientHandlerService.game = mockGameLobby;
        mockClientHandlerService.client = mockClient;

        gameOrganizerState = new GameOrganizerState(mockGameManagerService, mockClientHandlerService);
    });

    describe('clearState', () => {
        it('should remove all listeners and set client as player', () => {
            gameOrganizerState.clearState();

            expect(mockClient.removeEventListeners.calledWith(GameManagementSocketEvent.StartGame)).to.be.equal(true);
            expect(mockClient.removeEventListeners.calledWith(GameManagementSocketEvent.NextQuestion)).to.be.equal(true);
            expect(mockClient.removeEventListeners.calledWith(GameManagementSocketEvent.ToggleLock)).to.be.equal(true);
            expect(mockClient.removeEventListeners.calledWith(GameManagementSocketEvent.BanPlayer)).to.be.equal(true);
            expect(mockClient.removeEventListeners.calledWith(GamePlayerSocketEvent.PlayerLeftGame)).to.be.equal(true);
            expect(mockClient.removeEventListeners.calledWith(GamePlayerSocketEvent.Disconnect)).to.be.equal(true);

            expect(mockClient.emitToUser.calledWith(GamePlaySocketEvent.SetAsPlayer)).to.be.equal(true);
        });
    });

    describe('startGame', () => {
        it('should start the game if the lobby is valid', async () => {
            mockGameLobby.canStartGame.returns(true);
            const mockStartedGame = createStubInstance(GameSessionBase);

            mockGameManagerService.createNormalGame.resolves(mockStartedGame);

            expect(mockClient.onUserEvent.args[0][0]).to.equal(GameManagementSocketEvent.StartGame);
            const callback = mockClient.onUserEvent.args[0][1];
            await callback();

            expect(mockGameLobby.gameStarted.calledWith(mockStartedGame)).to.equal(true);
            expect(mockGameManagerService.createNormalGame.calledWith(mockGameLobby)).to.equal(true);
        });

        it('should not start the game if the lobby is invalid', async () => {
            mockGameLobby.canStartGame.returns(false);

            expect(mockClient.onUserEvent.args[0][0]).to.equal(GameManagementSocketEvent.StartGame);
            const callback = mockClient.onUserEvent.args[0][1];
            await callback();

            expect(mockGameManagerService.createNormalGame.called).to.equal(false);
        });
    });

    it('should register a callback for the NEXT_QUESTION_EVENT', async () => {
        mockClientHandlerService.game = mockGameSession;
        const goToNextQuestionCallback = mockClient.onUserEvent.args.find((args) => args[0] === GameManagementSocketEvent.NextQuestion)[1];
        goToNextQuestionCallback();
        expect(mockGameSession.continueQuiz.calledOnce).to.equal(true);
    });

    it('should not throw an error when going to next question with a GameLobby instead of GameSession', () => {
        mockClientHandlerService.game = mockGameLobby;

        expect(() => gameOrganizerState['goToNextQuestion']()).not.to.throw();
    });

    it('should register a callback for the TOGGLE_LOCK_EVENT', async () => {
        const toggleLockCallback = mockClient.onUserEvent.args.find((args) => args[0] === GameManagementSocketEvent.ToggleLock)[1];
        const successCallback = stub();
        mockGameLobby.toggleLock.returns(true);

        toggleLockCallback(successCallback);

        expect(mockGameLobby.toggleLock.calledOnce).to.equal(true);
        expect(successCallback.calledWith(true)).to.equal(true);
    });

    it('should register a callback for the BAN_PLAYER_EVENT', () => {
        const banPlayerCallback = mockClient.onUserEvent.args.find((args) => args[0] === GameManagementSocketEvent.BanPlayer)[1];
        const playerUsername = 'testPlayer';

        banPlayerCallback(playerUsername);

        expect(mockGameLobby.banPlayer.calledWith(playerUsername)).to.equal(true);
    });

    it('should not throw an error when banning a player with a GameSessionBase', () => {
        const playerUsername = 'someUsername';
        mockClientHandlerService.game = mockGameSession;

        expect(() => gameOrganizerState['banPlayer'](playerUsername)).not.to.throw();
    });

    it('should not throw an error when toggling lock with a game lobby', () => {
        const mockToggleLockReturnValue = true;
        mockGameLobby.toggleLock.returns(mockToggleLockReturnValue);
        mockClientHandlerService.game = mockGameSession;

        expect(() => gameOrganizerState['toggleLock']()).not.to.throw();
    });

    it('should register a callback for the PLAYER_LEFT_GAME_EVENT', () => {
        const leaveGameCallback = mockClient.onUserEvent.args.find((args) => args[0] === GamePlayerSocketEvent.PlayerLeftGame)[1];

        leaveGameCallback();

        expect(mockGameLobby.removeOrganizer.calledOnce).to.equal(true);
        expect(mockClientHandlerService.resetState.calledOnce).to.equal(true);
    });

    it('should register a callback for the DISCONNECT_EVENT', () => {
        const leaveGameCallback = mockClient.onUserEvent.args.find((args) => args[0] === GamePlayerSocketEvent.Disconnect)[1];

        leaveGameCallback();

        expect(mockGameLobby.removeOrganizer.calledOnce).to.equal(true);
        expect(mockClientHandlerService.resetState.calledOnce).to.equal(true);
    });

    it('should reset client state when game is undefined and not throw an error', () => {
        mockClientHandlerService.game = undefined;

        gameOrganizerState['leaveGame']();

        expect(mockClientHandlerService.resetState.calledOnce).to.equal(true);
    });

    it('should update state to player state if the gameStarted is a random game', () => {
        const mockGame = createStubInstance(GameLobby);
        mockGame.futureGameType = GameType.RandomGame;

        gameOrganizerState['handleGameStartedObserver'](mockGame, createStubInstance(GameSessionBase));

        expect(mockClientHandlerService.updateState.calledWith(ClientState.GamePlayer));
    });
});
