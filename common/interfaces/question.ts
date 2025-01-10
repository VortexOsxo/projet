import { QuestionType } from '../enums/question-type';
import { Choice } from './choice';

export interface Question {
    id: string;
    text: string;
    points: number;
    type: QuestionType;
    choices: Choice[];
    answer?: string; // Ajout de la propriété 'answer'
    lastModification: Date;
}
