import { Question } from '@common/interfaces/question';

export interface QuestionWithIndex extends Question {
    index: number;
}
