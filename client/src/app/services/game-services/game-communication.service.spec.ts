import { TestBed } from '@angular/core/testing';

import { GameCommunicationService } from './game-communication.service';
import { GameHistory } from '@common/interfaces/game-history';
import { environment } from 'src/environments/environment';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { DataSocketEvent } from '@common/enums/socket-event/data-socket-event';

const testGames: GameHistory[] = [
    {
        id: '1',
        gameName: 'Game 1',
        startDate: new Date(),
        playersNb: 5,
        bestScore: 100,
    },
    {
        id: '2',
        gameName: 'Game 2',
        startDate: new Date(),
        playersNb: 3,
        bestScore: 80,
    },
];

describe('GameCommunicationService', () => {
    let service: GameCommunicationService;
    const baseUrl: string = environment.serverUrl;
    let httpMock: HttpTestingController;

    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GameCommunicationService, { provide: SocketFactoryService, useValue: socketFactoryServiceSpy }],
        });
        service = TestBed.inject(GameCommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should retrieve games via GET request', () => {
        service.getGames().subscribe((games: GameHistory[]) => {
            expect(games).toEqual(testGames);
        });

        const request = httpMock.expectOne(`${baseUrl}/game-history`);
        expect(request.request.method).toBe('GET');
        request.flush(testGames);
    });

    it('should delete games via DELETE request', () => {
        service.deleteGames().subscribe();

        const request = httpMock.expectOne(`${baseUrl}/game-history`);
        expect(request.request.method).toBe('DELETE');
        request.flush('some response');
    });

    it('should emit event that gameHistory was modified on proper event', () => {
        expect(socketServiceSpy.on).toHaveBeenCalledWith(DataSocketEvent.GameHistoryChangedNotification, jasmine.any(Function));

        const emitSpy = spyOn(service.gameHistoryModified, 'emit');

        const callback = socketServiceSpy.on.calls.argsFor(0)[1] as () => void;
        callback();

        expect(emitSpy).toHaveBeenCalledWith();
    });
});
