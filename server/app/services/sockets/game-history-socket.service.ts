import { Service } from 'typedi';
import { BaseSocketHandler } from './base-socket-handler';
import { GAME_HISTORY_SOCKET_NAME } from '@common/config/socket-config';
import { DataSocketEvent } from '@common/enums/socket-event/data-socket-event';

@Service()
export class GameHistorySocket extends BaseSocketHandler {
    socketName: string = GAME_HISTORY_SOCKET_NAME;

    emitGameHistoryChangedNotification() {
        this.socketManager.emit(DataSocketEvent.GameHistoryChangedNotification);
    }
}
