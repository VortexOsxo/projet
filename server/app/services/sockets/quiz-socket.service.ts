import { Service } from 'typedi';
import { BaseSocketHandler } from './base-socket-handler';
import { QUIZ_SOCKET_NAME } from '@common/config/socket-config';
import { DataSocketEvent } from '@common/enums/socket-event/data-socket-event';

@Service()
export class QuizSocket extends BaseSocketHandler {
    socketName: string = QUIZ_SOCKET_NAME;

    emitQuizChangedNotification() {
        this.socketManager.emit(DataSocketEvent.QuizChangedNotification);
    }
}
