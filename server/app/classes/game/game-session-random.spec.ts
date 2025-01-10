import { expect } from 'chai';
import { stub, createStubInstance, SinonStubbedInstance, spy, restore } from 'sinon';
import { GameSessionRandom } from './game-session-random';
import { Client } from '@app/classes/client';
import { GameConfig } from '@app/interfaces/game-config';
import { TimerService } from '@app/services/timer.service';
import { GameQuizHandlerService } from '@app/services/game/game-quiz-handler.service';
import { Quiz } from '@common/interfaces/quiz';

describe('GameSessionRandom', () => {
    let gameSessionRandom: GameSessionRandom;

    let timerServiceStub: SinonStubbedInstance<TimerService>;
    let gameQuizHandlerServiceStub: SinonStubbedInstance<GameQuizHandlerService>;

    let gameConfigMock: GameConfig;

    let organizer: SinonStubbedInstance<Client>;
    let player1: SinonStubbedInstance<Client>;
    let player2: SinonStubbedInstance<Client>;

    beforeEach(() => {
        organizer = createStubInstance(Client);
        player1 = createStubInstance(Client);
        player2 = createStubInstance(Client);

        gameConfigMock = { gameId: 123, organizer, quiz: {} as Quiz };
        timerServiceStub = createStubInstance(TimerService);
        timerServiceStub.setStopCondition.returns(timerServiceStub);
        timerServiceStub.setOnTickCallBack.returns(timerServiceStub);
        timerServiceStub.setOnTimerEndedCallback.returns(timerServiceStub);

        gameQuizHandlerServiceStub = createStubInstance(GameQuizHandlerService);

        gameSessionRandom = new GameSessionRandom(timerServiceStub, gameQuizHandlerServiceStub, gameConfigMock);
    });

    afterEach(() => {
        restore();
    });

    describe('setPlayers', () => {
        it('should set players and remove players without names', () => {
            player1.name = 'Player 1';
            player2.name = '';

            gameSessionRandom['organizer'] = organizer;

            gameSessionRandom.setPlayers([player1, player2]);

            expect(gameSessionRandom['players']).to.deep.equal([player1, organizer]);
        });
    });

    describe('removePlayer', () => {
        it('should remove the player and clear the game if no players left', () => {
            gameSessionRandom['players'] = [player1];
            const superRemovePlayerSpy = spy(GameSessionRandom.prototype, 'removePlayer');
            const clearGameStub = stub(gameSessionRandom as unknown as { clearGame: () => void }, 'clearGame');

            gameSessionRandom.removePlayer(player1);

            expect(superRemovePlayerSpy.calledOnceWithExactly(player1)).to.equal(true);
            expect(clearGameStub.called).to.equal(true);
        });

        it('should not clear the game if players are left', () => {
            const superRemovePlayerStub = stub(GameSessionRandom.prototype, 'removePlayer').returns(true);
            const clearGameStub = stub(gameSessionRandom as unknown as { clearGame: () => void }, 'clearGame');

            gameSessionRandom['players'] = [player1, player2];

            const result = gameSessionRandom.removePlayer(player1);

            expect(result).to.equal(true);
            expect(superRemovePlayerStub.calledOnceWithExactly(player1)).to.equal(true);
            expect(clearGameStub.called).to.equal(false);
        });

        it('should return false if super.removePlayer returns false', () => {
            const superRemovePlayerSpy = spy(GameSessionRandom.prototype, 'removePlayer');
            const result = gameSessionRandom.removePlayer(player1);

            expect(result).to.equal(false);
            expect(superRemovePlayerSpy.calledOnceWithExactly(player1)).to.equal(true);
        });
    });

    describe('correctionWasFinished', () => {
        it('should call super.correctionWasFinished and continue the quiz', () => {
            const continueQuizSpy = spy(gameSessionRandom, 'continueQuiz');

            gameSessionRandom.correctionWasFinished();

            expect(continueQuizSpy.calledOnce).to.equal(true);
        });
    });

    describe('shouldGoToCorrectionState', () => {
        it('should return false', () => {
            expect(gameSessionRandom['shouldGoToCorrectionState']()).to.equal(false);
        });
    });
});
