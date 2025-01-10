import * as http from 'http';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { BaseSocketHandler } from './base-socket-handler';

@Service({ transient: true })
export class SocketManager {
    private static server: http.Server | null;

    private sio: io.Server | null;

    static setUpHttpServer(server: http.Server) {
        this.server = server;
    }

    createSocketServer(socketHandler: BaseSocketHandler) {
        if (!SocketManager.server) throw new Error('HttpServer reference has not been given');
        this.sio = new io.Server(SocketManager.server, {
            cors: { origin: '*', methods: ['GET', 'POST'] },
            path: `/websocket/${socketHandler.socketName}/`,
        });

        this.sio.on('connection', (socket) => {
            socketHandler.onConnection(socket);
        });
    }

    emit<T>(event: string, emitValue?: T) {
        if (emitValue) this.sio.sockets.emit(event, emitValue);
        else this.sio.sockets.emit(event);
    }

    emitToRoom<T>(room: string, event: string, emitValue?: T) {
        if (emitValue) this.sio.to(room).emit(event, emitValue);
        else this.sio.to(room).emit(event);
    }
}
