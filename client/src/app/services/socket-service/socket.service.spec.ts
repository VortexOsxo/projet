import { TestBed } from '@angular/core/testing';

import { SocketService } from './socket.service';
import { Socket } from 'socket.io-client';

describe('SocketService', () => {
    let service: SocketService;
    let socketSpy: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        socketSpy = jasmine.createSpyObj('Socket', ['on', 'emit']);

        TestBed.configureTestingModule({});
        service = new SocketService('test');
        service['socket'] = socketSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call callback when event is received', () => {
        const testName = 'test';
        const testFunc = () => {
            // empty function
        };
        service.on(testName, testFunc);

        expect(socketSpy.on).toHaveBeenCalledWith(testName, testFunc);
    });

    it('should properly send event with emit method', () => {
        const testName = 'test';
        const testValue = 3;
        service.emit(testName, testValue);

        expect(socketSpy.emit).toHaveBeenCalledWith(testName, testValue);
    });

    it('should be able to only send event without value', () => {
        const testName = 'test';
        service.emit(testName);

        expect(socketSpy.emit).toHaveBeenCalledWith(testName);
    });

    it('should be able to only send event without value with an ack', () => {
        const testName = 'test';
        const testAck = () => {
            // empty body
        };
        service.emit(testName, testAck);

        expect(socketSpy.emit).toHaveBeenCalledWith(testName, testAck);
    });

    it('should be able to only send with value and ack', () => {
        const testName = 'test';
        const testValue = 123;
        const testAck = () => {
            // empty body
        };
        service.emit(testName, testValue, testAck);

        expect(socketSpy.emit).toHaveBeenCalledWith(testName, testValue, testAck);
    });
});
