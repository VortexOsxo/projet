import { Service } from 'typedi';
import { DataManagerService } from '@app/services/data/data-manager.service';
import { Quiz } from '@common/interfaces/quiz';
import { CommonDataControllerService } from './common-data.controller';
import { QuizSocket } from '@app/services/sockets/quiz-socket.service';
import { QUIZ_COLLECTION } from '@app/consts/database.consts';

@Service()
export class QuizController extends CommonDataControllerService<Quiz> {
    constructor(
        dataManagerService: DataManagerService<Quiz>,
        private quizSocket: QuizSocket,
    ) {
        super(dataManagerService, QUIZ_COLLECTION);
    }

    protected onElementModification() {
        this.quizSocket.emitQuizChangedNotification();
    }

    protected configureRouter(): void {
        this.router.get('/', this.getAllElements.bind(this));
        this.router.get('/:id', this.getElementById.bind(this));
        this.router.post('/', this.addElement.bind(this));
        this.router.put('/', this.replaceElement.bind(this));
        this.router.delete('/:id', this.deleteElement.bind(this));
    }
}
