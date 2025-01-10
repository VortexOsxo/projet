import { expect } from 'chai';
import { GameManagerService } from '@app/services/game/game-manager.service';
import { ClientHandlerService } from './client-handler.service';
import { Client } from '@app/classes/client';
import { DefaultState } from '@app/services/client/client-handler-states/client-default-state.service';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { ClientState } from '@app/enums/client-state';
import { GameOrganizerState } from '@app/services/client/client-handler-states/game-organizer-state.service';
import { GamePlayerState } from '@app/services/client/client-handler-states/game-player-state.service';
import { GameLeaderboardState } from '@app/services/client/client-handler-states/game-leaderboard-state.service';
import { Subject } from 'rxjs';
import { GameLobby } from '@app/classes/game/game-lobby';
import { GameBase } from '@app/classes/game/game-base';

describe('ClientHandlerService', () => {
    let clientHandlerService: ClientHandlerService;
    let gameManagerServiceMock: SinonStubbedInstance<GameManagerService>;
    let clientMock: SinonStubbedInstance<Client>;
    let gameMock: SinonStubbedInstance<GameLobby>;

    beforeEach(() => {
        gameManagerServiceMock = createStubInstance(GameManagerService);
        clientMock = createStubInstance(Client);

        gameMock = createStubInstance(GameLobby);
        gameMock.removedUserSubject = createStubInstance(Subject);
        gameMock.addedPlayerSubject = createStubInstance(Subject);
        gameMock.gameStartedSubject = createStubInstance(Subject);

        clientHandlerService = new ClientHandlerService(clientMock, gameManagerServiceMock);
        clientHandlerService['game'] = gameMock;
    });

    it('should initialize with the correct initial state', () => {
        expect(clientHandlerService['clientHandlerState']).to.be.an.instanceOf(DefaultState);
    });

    it('should return the correct game using getGame() method', () => {
        const gameStub = {} as GameSessionBase;
        clientHandlerService['game'] = gameStub;

        expect(clientHandlerService.game).to.equal(gameStub);
    });

    it('should return the correct client using getClient() method', () => {
        expect(clientHandlerService.client).to.equal(clientMock);
    });

    it('should reset the state correctly using resetState() method', () => {
        const gameStub = {} as GameBase;
        clientHandlerService['game'] = gameStub;
        clientHandlerService.resetState();

        expect(clientHandlerService['game']).to.equal(undefined);

        expect(clientHandlerService['clientHandlerState']).to.be.an.instanceOf(DefaultState);
    });

    it('should update the state correctly using updateState() method', () => {
        const previousState = createStubInstance(DefaultState);

        clientHandlerService['clientHandlerState'] = previousState;

        clientHandlerService.updateState(ClientState.GameOrganizer);
        expect(clientHandlerService['clientHandlerState']).instanceOf(GameOrganizerState);

        expect(previousState.clearState.calledOnce).to.equal(true);
    });

    it('should change to the proper state', () => {
        clientHandlerService.updateState(ClientState.Default);
        expect(clientHandlerService['clientHandlerState']).instanceOf(DefaultState);

        clientHandlerService.updateState(ClientState.GamePlayer);
        expect(clientHandlerService['clientHandlerState']).instanceOf(GamePlayerState);

        clientHandlerService.updateState(ClientState.GameLeaderboard);
        expect(clientHandlerService['clientHandlerState']).instanceOf(GameLeaderboardState);
    });
});
