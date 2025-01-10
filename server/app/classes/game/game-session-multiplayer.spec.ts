import { expect } from 'chai';
import { Player } from '@app/interfaces/users/player';
import { restore, stub, createStubInstance, SinonStubbedInstance } from 'sinon';
import { TimerService } from '@app/services/timer.service';
import { GameQuizHandlerService } from '@app/services/game/game-quiz-handler.service';
import { GameConfig } from '@app/interfaces/game-config';
import { Quiz } from '@common/interfaces/quiz';
import { Client } from '@app/classes/client';
import { GameSessionMultiplayer } from './game-session-multiplayer';

describe('GameSessionMultiplayer', () => {
    let gameSessionMultiplayer: GameSessionMultiplayer;

    let timerServiceStub: SinonStubbedInstance<TimerService>;
    let gameQuizHandlerServiceStub: SinonStubbedInstance<GameQuizHandlerService>;

    let gameConfigMock: GameConfig;

    let organizer: SinonStubbedInstance<Client>;
    let player1: SinonStubbedInstance<Client>;
    let player2: SinonStubbedInstance<Client>;

    let players: Player[];

    beforeEach(() => {
        organizer = createStubInstance(Client);
        player1 = createStubInstance(Client);
        player2 = createStubInstance(Client);
        players = [player1, player2];

        gameConfigMock = { gameId: 123, organizer, quiz: {} as Quiz };
        timerServiceStub = createStubInstance(TimerService);
        timerServiceStub.setStopCondition.returns(timerServiceStub);
        timerServiceStub.setOnTickCallBack.returns(timerServiceStub);
        timerServiceStub.setOnTimerEndedCallback.returns(timerServiceStub);

        gameQuizHandlerServiceStub = createStubInstance(GameQuizHandlerService);
        gameSessionMultiplayer = new GameSessionMultiplayer(timerServiceStub, gameQuizHandlerServiceStub, gameConfigMock);
    });

    afterEach(() => {
        restore();
    });

    describe('setUp', () => {
        it('should call super.setUp() and showIntermission', () => {
            const showLoadingStub = stub(gameSessionMultiplayer as unknown as { showLoading: () => void }, 'showLoading');

            gameSessionMultiplayer.setUp();
            expect(showLoadingStub.called).to.equal(true);
        });
    });

    it('should set players and remove players without names', () => {
        player2.name = 'mockName';
        player1.name = '';
        gameSessionMultiplayer.setPlayers(players);

        expect(gameSessionMultiplayer['players']).to.deep.equal([player2]);
    });
});
