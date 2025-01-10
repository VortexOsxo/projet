import { PlayerState } from '@common/enums/user-answer-state';
import { User } from './user';

export interface Player extends User {
    name: string;
    score?: number;
    bonusCount?: number;
    answerState: PlayerState;
}
