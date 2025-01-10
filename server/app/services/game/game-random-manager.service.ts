import { Service } from 'typedi';
import { DataManagerService } from '@app/services/data/data-manager.service';
import { Question } from '@common/interfaces/question';
import { QUESTION_COLLECTION } from '@app/consts/database.consts';
import { Quiz } from '@common/interfaces/quiz';
import { QuestionType } from '@common/enums/question-type';
import { RANDOM_QUIZ_QUESTION_NUMBER } from '@common/config/game-config';
import { HALF_PROBABILITY, RANDOM_GAME_DESCRIPTION, RANDOM_GAME_DURATION, RANDOM_GAME_TITLE } from '@app/consts/random-game.consts';

@Service()
export class GameRandomManagerService {
    constructor(private dataManagerService: DataManagerService<Question>) {
        dataManagerService.setCollection(QUESTION_COLLECTION);
    }

    async createRandomQuiz(): Promise<Quiz> {
        return {
            id: '0',
            title: RANDOM_GAME_TITLE,
            description: RANDOM_GAME_DESCRIPTION,
            questions: await this.getRandomQuestions(),
            duration: RANDOM_GAME_DURATION,
            lastModification: new Date(),
            isVisible: true,
        };
    }

    async getRandomQuestions() {
        const questions = (await this.dataManagerService.getElements()).filter((question) => question.type === QuestionType.QCM);
        const shuffled = questions.sort(() => HALF_PROBABILITY - Math.random());
        return shuffled.slice(0, RANDOM_QUIZ_QUESTION_NUMBER);
    }
}
