import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
export class SocketFactoryService {
    private sockets: Map<string, SocketService> = new Map();

    // The goal of this factory is to provide different instance of the socket service instead of having a singleton
    getSocket(socketPath: string): SocketService {
        if (!this.sockets.has(socketPath)) this.createSocket(socketPath);
        return this.sockets.get(socketPath) as SocketService;
    }

    private createSocket(socketPath: string) {
        this.sockets.set(socketPath, new SocketService(socketPath));
    }
}
