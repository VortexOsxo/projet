import { Service } from 'typedi';
import { BaseSocketHandler } from './base-socket-handler';
import { QUESTION_SOCKET_NAME } from '@common/config/socket-config';
import { DataSocketEvent } from '@common/enums/socket-event/data-socket-event';

@Service()
export class QuestionSocket extends BaseSocketHandler {
    socketName: string = QUESTION_SOCKET_NAME;

    emitQuestionChangedNotification() {
        this.socketManager.emit(DataSocketEvent.QuestionChangedNotification);
    }
}
