import { GameType } from '@common/enums/game-type';
import { Quiz } from './quiz';

export interface GameInfo {
    gameId: number,
    quizToPlay: Quiz,
    gameType: GameType,
}