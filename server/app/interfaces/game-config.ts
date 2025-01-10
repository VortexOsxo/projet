import { Quiz } from '@common/interfaces/quiz';
import { User } from './users/user';
import { GameType } from '@common/enums/game-type';

export interface GameConfig {
    organizer: User;
    gameId: number;
    quiz: Quiz;
    futureGameType?: GameType;
}
