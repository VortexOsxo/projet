import { expect } from 'chai';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { BaseGameObserver } from './base-observer';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Player } from '@app/interfaces/users/player';
import { User } from '@app/interfaces/users/user';
import { Client } from '@app/classes/client';
import { QuestionWithIndex } from '@app/interfaces/question-with-index';

describe('BaseGameObserver', () => {
    let mockGame: SinonStubbedInstance<GameSessionBase>;

    class TestGameObserver extends BaseGameObserver {
        protected setUpGameObserver(): void {
            // No implementation needed for testing
        }
    }

    const mockQuestion = { text: 'Mock question', index: 3 } as QuestionWithIndex;
    const mockPlayers = [{ name: 'Player1' } as Player, { name: 'Player2' } as Player];
    const mockOrganizer = {} as User;

    let testObserver: TestGameObserver;

    beforeEach(() => {
        mockGame = createStubInstance(GameSessionBase);

        mockGame.getQuestion.returns(mockQuestion);
        mockGame.players = mockPlayers;
        mockGame.organizer = mockOrganizer;

        testObserver = new TestGameObserver(mockGame);
    });

    it('should return the correct question', () => {
        expect(testObserver.question).to.equal(mockQuestion);
    });

    it('should return the correct users', () => {
        const organizer = createStubInstance(Client);
        const mockUsers = [createStubInstance(Client), createStubInstance(Client)];
        mockGame['players'] = mockUsers;
        mockGame['organizer'] = organizer;

        expect(testObserver.users).to.deep.equal([...mockUsers, organizer]);
    });

    it('should return the correct players', () => {
        expect(testObserver.players).to.deep.equal(mockPlayers);
    });

    it('should return the correct organizer', () => {
        expect(testObserver.organizer).to.equal(mockOrganizer);
    });
});
