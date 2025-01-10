import { GameSessionBase } from '@app/classes/game/game-session-base';
import { QuestionWithIndex } from '@app/interfaces/question-with-index';
import { Player } from '@app/interfaces/users/player';
import { User } from '@app/interfaces/users/user';

export abstract class BaseGameObserver {
    constructor(protected game: GameSessionBase) {
        this.setUpGameObserver(game);
    }

    get question(): QuestionWithIndex {
        return this.game.getQuestion();
    }

    get users(): User[] {
        return this.game.users;
    }

    get players(): Player[] {
        return this.game.players;
    }

    get organizer(): User {
        return this.game.organizer;
    }

    protected abstract setUpGameObserver(game: GameSessionBase): void;
}
