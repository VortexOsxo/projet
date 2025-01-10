import { TestBed } from '@angular/core/testing';
import { GameInfoService } from './game-info.service';
import { Quiz } from '@common/interfaces/quiz';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { GameInfo } from '@common/interfaces/game-info';
import { BehaviorSubject } from 'rxjs';
import { GameType } from '@common/enums/game-type';

describe('GameInfoService', () => {
    let service: GameInfoService;
    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    const quizMock: Quiz = { title: 'quiz' } as Quiz;
    const mockUsername = 'name123';

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        TestBed.configureTestingModule({
            providers: [{ provide: SocketFactoryService, useValue: socketFactoryServiceSpy }],
        });
        service = TestBed.inject(GameInfoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getter should return the last value the observable got', () => {
        it('get quiz', () => {
            service['quizSubject'].next(quizMock);

            expect(service.getQuiz()).toBe(quizMock);
        });

        it('getQuizAsObservable should return a observable for the quiz', () => {
            let observedValue: Quiz = { title: 'wrongQuiz' } as Quiz;

            const quizObservable = service.getQuizObservable();
            quizObservable.subscribe((quizValue) => {
                observedValue = quizValue;
            });

            service['quizSubject'].next(quizMock);
            expect(observedValue).toEqual(quizMock);
        });

        it('get username', () => {
            service['usernameSubject'].next(mockUsername);

            expect(service.getUsername()).toBe(mockUsername);
        });

        it('get gameId', () => {
            const mockId = 1234;
            service['gameIdSubject'].next(mockId);

            expect(service.getGameId()).toBe(mockId);
        });

        it('get gameType', () => {
            service['gameTypeSubject'].next(GameType.LobbyGame);

            expect(service.getGameType()).toBe(GameType.LobbyGame);
        });
    });

    it('setUsername should update the behaviorSubject related', () => {
        const usernameSubjectSpy = spyOn(service['usernameSubject'], 'next');

        service.setUsername(mockUsername);

        expect(usernameSubjectSpy).toHaveBeenCalledOnceWith(mockUsername);
    });

    describe('socket event handlers', () => {
        let quizSubjectSpy: jasmine.Spy<jasmine.Func>;
        let gameIdSubjectSpy: jasmine.Spy<jasmine.Func>;

        beforeEach(() => {
            service['setUpSocket']();
            quizSubjectSpy = spyOn(service['quizSubject'], 'next');
            gameIdSubjectSpy = spyOn(service['gameIdSubject'], 'next');
        });

        it('should update game info on sendGameInfo', () => {
            const gameInfoMock: GameInfo = {
                quizToPlay: quizMock,
                gameId: 1234,
                gameType: GameType.NormalGame,
            };

            expect(socketServiceSpy.on).toHaveBeenCalledWith('sendGameInfo', jasmine.any(Function));

            const callback = socketServiceSpy.on.calls.argsFor(0)[1] as (gameInfo: GameInfo) => void;
            callback(gameInfoMock);

            expect(quizSubjectSpy).toHaveBeenCalledWith(gameInfoMock.quizToPlay);
            expect(gameIdSubjectSpy).toHaveBeenCalledWith(gameInfoMock.gameId);
        });

        it('should return quiz observable', () => {
            const quiz: Quiz = { title: 'hello' } as Quiz;

            service['quizSubject'] = new BehaviorSubject<Quiz>(quiz);

            service.getQuizObservable().subscribe((obeservedQuiz) => {
                expect(obeservedQuiz).toBe(quiz);
            });
        });

        it('should return username observable', () => {
            const username = 'testUser';
            service['usernameSubject'] = new BehaviorSubject<string>(username);

            service.getUsernameObservable().subscribe((name) => {
                expect(name).toBe(username);
            });
        });

        it('should set username', () => {
            const newUsername = 'newUser';
            service.setUsername(newUsername);
            expect(service.getUsername()).toBe(newUsername);
        });
    });
});
