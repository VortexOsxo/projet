import { PlayerState } from '../enums/user-answer-state';
export interface Player {
    name: string;
    score: number;
    bonusCount: number;
    answerState: PlayerState;
}
