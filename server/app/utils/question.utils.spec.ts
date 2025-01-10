import { expect } from 'chai';
import { getValidAnswers } from './question.utils';
import { Question } from '@common/interfaces/question';

describe('getValidAnswers', () => {
    it('should return valid answer indices', () => {
        const question: Question = {
            text: 'What is the capital of France?',
            choices: [
                { text: 'Paris', isCorrect: true },
                { text: 'London', isCorrect: false },
                { text: 'Berlin', isCorrect: false },
                { text: 'Rome', isCorrect: false },
            ],
        } as Question;

        const validAnswers = getValidAnswers(question);
        expect(validAnswers).to.deep.equal([0]);
    });

    it('should return empty array if question is undefined', () => {
        const question: Question | undefined = undefined;

        const validAnswers = getValidAnswers(question);
        expect(validAnswers).to.deep.equal([]);
    });

    it('should return empty array if no valid answers', () => {
        const question: Question = {
            text: 'What is the capital of France?',
            choices: [
                { text: 'London', isCorrect: false },
                { text: 'Berlin', isCorrect: false },
                { text: 'Rome', isCorrect: false },
            ],
        } as Question;

        const validAnswers = getValidAnswers(question);
        expect(validAnswers).to.deep.equal([]);
    });
});
