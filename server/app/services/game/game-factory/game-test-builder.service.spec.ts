import { expect } from 'chai';
import { GameConfig } from '@app/interfaces/game-config';
import { GameQuizHandlerService } from '@app/services/game/game-quiz-handler.service';
import { Quiz } from '@common/interfaces/quiz';
import { Client } from '@app/classes/client';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { TimerService } from '@app/services/timer.service';
import { Container } from 'typedi';
import { GameTestBuilderService } from './game-test-builder.service';
import { GameSessionTest } from '@app/classes/game/game-session-test';
import { AnswerManagerQCM } from '@app/services/game/game-listeners/answer-managers/answer-manager-qcm.service';
import { AnswerManagerQRLTest } from '@app/services/game/game-listeners/answer-managers/answer-manager-qrl-test';
import { Question } from '@common/interfaces/question';

describe('GameTestBuilderService', () => {
    let gameTestBuilderService: GameTestBuilderService;
    let organizerStub: SinonStubbedInstance<Client>;

    let containerSetStub: SinonStub;
    let containerGetStub: SinonStub;

    beforeEach(() => {
        organizerStub = createStubInstance(Client);

        containerSetStub = stub(Container, 'set');
        containerGetStub = stub(Container, 'get');

        gameTestBuilderService = new GameTestBuilderService();
    });

    afterEach(() => {
        containerSetStub.restore();
        containerGetStub.restore();
    });

    it('should build a GameSessionTest object with correct configuration and players', () => {
        const gameConfig: GameConfig = {
            gameId: 1,
            quiz: {
                questions: [{} as Question],
            } as Quiz,
            organizer: organizerStub,
        };

        containerGetStub.withArgs(AnswerManagerQCM).returns(createStubInstance(AnswerManagerQCM));
        containerGetStub.withArgs(AnswerManagerQRLTest).returns(createStubInstance(AnswerManagerQRLTest));

        const gameSessionTest = gameTestBuilderService.buildGame(gameConfig);

        expect(gameSessionTest).to.be.an.instanceOf(GameSessionTest);
        expect(gameSessionTest).to.have.property('timerService').that.is.an.instanceOf(TimerService);
        expect(gameSessionTest).to.have.property('quizHandler').that.is.an.instanceOf(GameQuizHandlerService);
    });
});
