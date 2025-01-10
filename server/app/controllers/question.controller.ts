import { Service } from 'typedi';
import { Question } from '@common/interfaces/question';
import { DataManagerService } from '@app/services/data/data-manager.service';
import { CommonDataControllerService } from './common-data.controller';
import { QUESTION_COLLECTION } from '@app/consts/database.consts';
import { QuestionSocket } from '@app/services/sockets/question-socket.service';

@Service()
export class QuestionController extends CommonDataControllerService<Question> {
    constructor(
        dataManagerService: DataManagerService<Question>,
        private questionSocket: QuestionSocket,
    ) {
        super(dataManagerService, QUESTION_COLLECTION);
    }

    protected onElementModification() {
        this.questionSocket.emitQuestionChangedNotification();
    }

    protected configureRouter(): void {
        this.router.get('/', this.getAllElements.bind(this));
        this.router.get('/:id', this.getElementById.bind(this));
        this.router.post('/', this.addElement.bind(this));
        this.router.put('/', this.replaceElement.bind(this));
        this.router.delete('/:id', this.deleteElement.bind(this));
    }
}
