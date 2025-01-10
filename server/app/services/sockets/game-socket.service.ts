import { Socket } from 'socket.io';
import { Service } from 'typedi';
import { BaseSocketHandler } from './base-socket-handler';
import { SocketManager } from './socket-manager.service';
import { ClientHandlerBuilder } from '@app/services/client/client-handler-builder.service';
import { GAME_SOCKET_NAME } from '@common/config/socket-config';

@Service()
export class GameSocket extends BaseSocketHandler {
    socketName: string = GAME_SOCKET_NAME;

    constructor(
        private gameUserHandlerBuidler: ClientHandlerBuilder,
        socketManager: SocketManager,
    ) {
        super(socketManager);
    }

    onConnection(socket: Socket): void {
        this.gameUserHandlerBuidler.build(socket);
    }
}
