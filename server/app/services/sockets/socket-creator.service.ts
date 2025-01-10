import { Server } from 'http';
import { Container, Service } from 'typedi';
import { SocketManager } from './socket-manager.service';
import { BaseSocketHandler } from './base-socket-handler';
import { ChatSocket } from './chat-socket.service';
import { GameSocket } from './game-socket.service';
import { QuizSocket } from './quiz-socket.service';
import { QuestionSocket } from './question-socket.service';
import { GameHistorySocket } from './game-history-socket.service';

// the type we want to represent here is any constructor that create a class of type BaseSocketHandler
// the argument of the constructor does not really matter as the container will provide them for us
// which is why we have ...args: any[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SocketHandlerConstructor<T extends BaseSocketHandler> = new (...args: any[]) => T;

@Service()
export class SocketCreatorService {
    static socketRegistry: SocketHandlerConstructor<BaseSocketHandler>[] = [QuizSocket, QuestionSocket, GameHistorySocket, GameSocket, ChatSocket];

    setUpSockets(server: Server) {
        SocketManager.setUpHttpServer(server);

        SocketCreatorService.socketRegistry.forEach((socketHandler) => {
            Container.get(socketHandler)?.setUpSocket();
        });
    }
}
