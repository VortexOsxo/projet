import { QuestionType } from '@common/enums/question-type';
import { Question } from '@common/interfaces/question';
import { Quiz } from '@common/interfaces/quiz';

export const MINIMUM_GAME_ID = 1000;
export const MAXIMUM_GAME_ID = 9999;

export const EMPTY_ID = '0';

export const GAME_ID = 'Game ID';
export const RANDOM_QUIZ = 'random';
export const PSEUDONYME = 'Pseudonyme';
export const ADMIN_PASSWORD_LOGIN = 'mot de passe';

export const NULL_QUIZ: Quiz = {
    id: '0',
    title: "Aucun Quiz n'est défini",
    description: '',
    questions: [],
    duration: 60,
    lastModification: new Date(),
    isVisible: true,
};

export const NULL_QUESTION: Question = {
    id: '0',
    text: 'Question Vide',
    points: 0,
    type: QuestionType.QCM,
    choices: [],
    lastModification: new Date(),
};
