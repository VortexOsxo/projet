import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

export class SocketService {
    private socket: Socket;

    constructor(socketPath: string) {
        this.socket = io(environment.socketUrl, { transports: ['websocket'], upgrade: false, path: `/websocket/${socketPath}/` });
    }

    on<T>(eventName: string, callback: (arg0: T) => void) {
        this.socket.on(eventName, callback);
    }

    emit<ValueType, CallBackArgType>(eventName: string, value?: ValueType, ack?: (arg: CallBackArgType) => void) {
        const args: unknown[] = [];
        if (value) args.push(value);
        if (ack) args.push(ack);

        this.socket.emit(eventName, ...args);
    }
}
