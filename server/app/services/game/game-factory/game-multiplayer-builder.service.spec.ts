import { expect } from 'chai';
import { GameMultiplayerBuilderService } from './game-multiplayer-builder.service';
import { GameConfig } from '@app/interfaces/game-config';
import { GameQuizHandlerService } from '@app/services/game/game-quiz-handler.service';
import { GameSessionNormal } from '@app/classes/game/game-session-normal';
import { Player } from '@app/interfaces/users/player';
import { Quiz } from '@common/interfaces/quiz';
import { Client } from '@app/classes/client';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { TimerService } from '@app/services/timer.service';
import { Container } from 'typedi';

describe('GameMultiplayerBuilderService', () => {
    let gameMultiplayerBuilderService: GameMultiplayerBuilderService;
    let organizerStub: SinonStubbedInstance<Client>;

    let containerSetStub: SinonStub;
    let containerGetStub: SinonStub;

    beforeEach(() => {
        organizerStub = createStubInstance(Client);

        containerSetStub = stub(Container, 'set');
        containerGetStub = stub(Container, 'get');

        gameMultiplayerBuilderService = new GameMultiplayerBuilderService();
    });

    afterEach(() => {
        containerSetStub.restore();
        containerGetStub.restore();
    });

    it('should build a GameSessionNormal object with correct configuration and players', () => {
        const timerServiceStub = createStubInstance(TimerService);
        timerServiceStub.setOnTimerEndedCallback.returns(timerServiceStub);
        containerGetStub.withArgs(TimerService).returns(timerServiceStub);

        const gameConfig: GameConfig = { gameId: 1, quiz: {} as Quiz, organizer: organizerStub };
        const players: Player[] = [];

        const gameSessionNormal = gameMultiplayerBuilderService.buildGame(GameSessionNormal, gameConfig, players);

        expect(gameSessionNormal).to.be.an.instanceOf(GameSessionNormal);
        expect(gameSessionNormal).to.have.property('timerService').that.is.an.instanceOf(TimerService);
        expect(gameSessionNormal).to.have.property('quizHandler').that.is.an.instanceOf(GameQuizHandlerService);
    });
});
