import { QuestionWithIndex } from '@app/interfaces/question-with-index';
import { Quiz } from '@common/interfaces/quiz';
import { Service } from 'typedi';

@Service({ transient: true })
export class GameQuizHandlerService {
    private questionIndex: number;
    private quiz: Quiz;

    constructor(quiz: Quiz) {
        this.questionIndex = 0;
        this.quiz = quiz;
    }

    goToNextQuestion() {
        ++this.questionIndex;
    }

    isQuizFinished(): boolean {
        return this.questionIndex >= this.quiz.questions.length;
    }

    getQuestion(): QuestionWithIndex {
        return this.isQuizFinished() ? undefined : { ...this.quiz.questions[this.questionIndex], index: this.questionIndex };
    }
}
