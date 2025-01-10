import { TestBed } from '@angular/core/testing';

import { SocketFactoryService } from './socket-factory.service';
import { SocketService } from './socket.service';

describe('SocketFactoryService', () => {
    let service: SocketFactoryService;
    const testPath = 'path';
    const testPath2 = 'path2';

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketFactoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should properly create a SocketService instance', () => {
        const socket = service.getSocket(testPath);
        expect(socket).toBeInstanceOf(SocketService);
    });

    it('should return same instances of SocketService for the same path', () => {
        const socket1 = service.getSocket(testPath);
        const socket2 = service.getSocket(testPath);

        expect(socket1).toEqual(socket2);
    });

    it('should return different instances of SocketService for the different path', () => {
        const socket1 = service.getSocket(testPath);
        const socket2 = service.getSocket(testPath2);

        expect(socket1).not.toEqual(socket2);
    });
});
