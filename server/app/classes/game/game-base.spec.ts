import { GameBase } from '@app/classes/game/game-base';
import { Player } from '@app/interfaces/users/player';
import { expect } from 'chai';
import { User } from '@app/interfaces/users/user';
import { Quiz } from '@common/interfaces/quiz';
import { GameConfig } from '@app/interfaces/game-config';
import { Subject } from 'rxjs';
import { UserRemoved } from '@app/interfaces/users/user-removed';
import { spy } from 'sinon';

describe('GameBase', () => {
    let gameBase: GameBase;
    const gameIdMock = 456;
    const quizMock = { id: 'mock-id' } as Quiz;

    let organiserMock: User;
    let playersMock: Player[];

    beforeEach(() => {
        organiserMock = {} as User;

        playersMock = [
            {
                name: 'player2',
                score: 12,
                bonusCount: 1,
            } as unknown as Player,
            {
                name: 'player1',
                score: 10,
                bonusCount: 0,
            } as unknown as Player,
        ];

        const config: GameConfig = { gameId: gameIdMock, organizer: organiserMock, quiz: quizMock };
        gameBase = new GameBase(config);
        gameBase['players'] = playersMock;
    });

    describe('Getter', () => {
        it('get game id should return the game id', () => {
            const resultGameId = gameBase.gameId;
            expect(resultGameId).to.equal(gameIdMock);
        });

        it('get quiz id should return the quiz id', () => {
            const resultQuizId = gameBase.quiz;
            expect(resultQuizId).to.equal(quizMock);
        });

        it('get organizer should return the organizer', () => {
            const resultOrganizer = gameBase.organizer;
            expect(resultOrganizer).to.equal(gameBase['organizer']);
        });
    });

    describe('removePlayer', () => {
        it('should remove the player from the game', () => {
            const playerToRemove: Player = playersMock[0];
            const result = gameBase.removePlayer(playerToRemove);

            expect(gameBase['players']).to.not.include(playerToRemove);

            expect(result).to.equal(true);
        });

        it('should return an unsuccessful response if player is not found', () => {
            const nonExistingPlayer: Player = { name: 'nonExistingPlayer' } as Player;

            const result = gameBase.removePlayer(nonExistingPlayer);

            expect(gameBase['players']).to.deep.equal(playersMock);

            expect(result).to.equal(false);
        });

        it('remove organiser should call clear game and set organizer to undefined', () => {
            const clearGameSpy = spy(gameBase as unknown as { clearGame: () => void }, 'clearGame');

            gameBase.removeOrganizer();

            expect(clearGameSpy.called).to.equal(true);
            expect(gameBase['organizer']).to.equal(undefined);
        });
    });

    it('should kick out all players and clear the game', () => {
        gameBase['players'] = playersMock;

        gameBase.removeOrganizer();

        expect(gameBase.players.length).to.equal(0);
        expect(gameBase['organizer']).to.equal(undefined);
    });

    describe('areTherePlayerLeft', () => {
        it('should return false when there are no players', () => {
            gameBase['players'] = [];

            expect(gameBase['areTherePlayerLeft']()).to.equal(false);
        });

        it('should return true when there are players', () => {
            expect(gameBase['areTherePlayerLeft']()).to.equal(true);
        });
    });

    it('should return the game configuration', () => {
        const resultConfig = gameBase.getGameConfig();

        expect(resultConfig.gameId).to.equal(gameIdMock);
        expect(resultConfig.organizer).to.equal(organiserMock);
        expect(resultConfig.quiz).to.equal(quizMock);
    });

    it('should remove the organizer and emit the user removed event', () => {
        const removedUserSubject = new Subject<UserRemoved>();
        gameBase['removedUserSubject'] = removedUserSubject;

        const reason = 'organizer left';
        gameBase['removeOrganizerIntern'](reason);

        removedUserSubject.subscribe((removedUser) => {
            expect(removedUser.user).to.equal(organiserMock);
            expect(removedUser.reason).to.equal(reason);
        });
    });
});
