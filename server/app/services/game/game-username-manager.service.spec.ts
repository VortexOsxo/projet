import { Container } from 'typedi';
import { GameUsernameManager } from './game-username-manager.service';
import { Player } from '@app/interfaces/users/player';
import { expect } from 'chai';

describe('GameUsernameManager', () => {
    let gameUsernameManager: GameUsernameManager;

    beforeEach(() => {
        gameUsernameManager = Container.get(GameUsernameManager);
    });

    describe('attemptSetUsername', () => {
        const mockPlayer: Player = { name: 'player1' } as Player;

        it('should set a new username if it is not already taken', () => {
            const desiredUsername = 'newUsername';
            const result = gameUsernameManager.attemptSetUsername(mockPlayer, desiredUsername);

            expect(result).to.equal(true);
            expect(mockPlayer.name).to.equal(desiredUsername);
        });

        it('should not set a new username if it is already taken', () => {
            const existingUsername = 'existingUsername';
            gameUsernameManager.addBannedUsername(existingUsername);

            const result = gameUsernameManager.attemptSetUsername(mockPlayer, existingUsername);

            expect(result).to.equal(false);
            expect(mockPlayer.name).to.not.equal(existingUsername);
        });
    });

    describe('addBannedUsername', () => {
        it('should add a username to the banned list', () => {
            const usernameToAdd = 'bannedUsername';

            gameUsernameManager.addBannedUsername(usernameToAdd);

            expect(gameUsernameManager['usernames'].has(usernameToAdd.toLowerCase())).to.equal(true);
        });
    });

    describe('removeBannedUsername', () => {
        it('should remove a username from the banned list', () => {
            const usernameToRemove = 'bannedUsername';
            gameUsernameManager.addBannedUsername(usernameToRemove);

            gameUsernameManager.removeBannedUsername(usernameToRemove);

            expect(gameUsernameManager['usernames'].has(usernameToRemove.toLowerCase())).to.equal(false);
        });
    });
});
