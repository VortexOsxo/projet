import { Player } from '@app/interfaces/users/player';
import { expect } from 'chai';
import { translatePlayer, translatePlayers } from './translate.utils';

describe('translate utils', () => {
    describe('translatePlayer', () => {
        it('should properly transform player object into player client', () => {
            const mockPlayer: Player = { name: 'player123' } as Player;

            const translatedPlayer = translatePlayer(mockPlayer);

            expect(translatedPlayer.name).to.equal(mockPlayer.name);
            expect(translatePlayer).not.equal(mockPlayer);
        });
    });

    describe('translatePlayers', () => {
        it('should properly transform array of player objects into array of player clients', () => {
            const mockPlayers: Player[] = [
                { name: 'player1', score: 100, bonusCount: 3 },
                { name: 'player2', score: 150, bonusCount: 2 },
                { name: 'player3', score: 200, bonusCount: 1 },
            ] as Player[];

            const translatedPlayers = translatePlayers(mockPlayers);

            expect(translatedPlayers.length).to.equal(mockPlayers.length);

            translatedPlayers.forEach((translatedPlayer, index) => {
                const mockPlayer = mockPlayers[index];
                expect(translatedPlayer.name).to.equal(mockPlayer.name);
                expect(translatedPlayer.score).to.equal(mockPlayer.score);
                expect(translatedPlayer.bonusCount).to.equal(mockPlayer.bonusCount);
            });
        });
    });
});
