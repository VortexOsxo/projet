import { TestBed } from '@angular/core/testing';
import { GameHistoryService } from './game-history.service';
import { GameHistory } from '@common/interfaces/game-history';
import { Observable, of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { GameCommunicationService } from './game-communication.service';
import { EventEmitter } from '@angular/core';

let testGame1: GameHistory;
let testGame2: GameHistory;

class MockGameCommunicationService {
    gameHistoryModified: EventEmitter<void> = new EventEmitter<void>();

    getGames(): Observable<GameHistory[]> {
        return of([testGame1, testGame2]);
    }
    deleteGames(): Observable<HttpResponse<string>> {
        const mockResponse = new HttpResponse({ status: 200, statusText: 'OK', body: 'Success' });
        return of(mockResponse);
    }
}

describe('GameHistoryService', () => {
    let service: GameHistoryService;

    beforeEach(() => {
        testGame1 = {
            id: '1',
            gameName: 'Game 1',
            startDate: new Date(),
            playersNb: 5,
            bestScore: 100,
        };
        testGame2 = {
            id: '2',
            gameName: 'Game 2',
            startDate: new Date(),
            playersNb: 3,
            bestScore: 80,
        };
        TestBed.configureTestingModule({
            providers: [{ provide: GameCommunicationService, useClass: MockGameCommunicationService }],
        });
        service = TestBed.inject(GameHistoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should delete games', () => {
        const gameCommunicationService = TestBed.inject(GameCommunicationService);
        const deleteGamesSpy = spyOn(gameCommunicationService, 'deleteGames').and.callThrough();

        service.deleteGames();

        expect(deleteGamesSpy).toHaveBeenCalled();
    });

    it('should get game observable', () => {
        service.getGameObservable().subscribe((games: GameHistory[]) => {
            expect(games).toEqual([testGame1, testGame2]);
        });
    });

    it('should call load history when event emiter of game communication service emit', () => {
        const gameCommunicationSpy: jasmine.SpyObj<GameCommunicationService> = jasmine.createSpyObj(GameCommunicationService, ['getGames']);
        gameCommunicationSpy.gameHistoryModified = new EventEmitter();
        gameCommunicationSpy.getGames.and.returnValue(of([testGame1, testGame2]));

        const gameService = new GameHistoryService(gameCommunicationSpy);
        const loadQuestionSpy = spyOn(gameService as unknown as { loadGames: () => GameHistory[] }, 'loadGames');

        gameCommunicationSpy.gameHistoryModified.emit();
        expect(loadQuestionSpy).toHaveBeenCalled();
    });
});
