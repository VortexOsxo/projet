import { Container, Service } from 'typedi';
import { GameManagerService } from '@app/services/game/game-manager.service';
import { Socket } from 'socket.io';
import { ClientHandlerService } from './client-handler.service';
import { Client } from '@app/classes/client';

@Service()
export class ClientHandlerBuilder {
    build(socket: Socket) {
        return new ClientHandlerService(new Client(socket), Container.get(GameManagerService));
    }
}
