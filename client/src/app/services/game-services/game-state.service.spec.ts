import { TestBed } from '@angular/core/testing';
import { UserGameState } from '@common/enums/user-game-state';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { GameStateService } from './game-state.service';

describe('GameStateService', () => {
    let service: GameStateService;
    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    let userGameStateSubjectNextSpy: jasmine.Spy;
    let organiserSubjectNextSpy: jasmine.Spy;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on']);

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        TestBed.configureTestingModule({
            providers: [GameStateService, { provide: SocketFactoryService, useValue: socketFactoryServiceSpy }],
        });
        service = TestBed.inject(GameStateService);

        userGameStateSubjectNextSpy = spyOn(service['userStateSubject'], 'next');
        organiserSubjectNextSpy = spyOn(service['bIsOrganizerSubject'], 'next').and.callThrough();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return initial user state as None', () => {
        service.getStateObservable().subscribe((state) => {
            expect(state).toEqual(UserGameState.None);
        });
    });

    it('getCurrentState should return the current state', () => {
        const expectedResult = service['userStateSubject'].value;

        expect(service.getCurrentState()).toEqual(expectedResult);
    });

    it('should return initial organizer state as false', () => {
        service.getIsOrganizerObservable().subscribe((isOrganizer) => {
            expect(isOrganizer).toEqual(false);
        });
    });

    it('should set state correctly when updateGameState event is received', () => {
        const newState = UserGameState.InGame;
        service['setState'](newState);
        expect(userGameStateSubjectNextSpy).toHaveBeenCalledWith(newState);
    });

    it('should set organizer state to true when setAsOrganizer event is received', () => {
        service['setAsOrganizer']();
        expect(organiserSubjectNextSpy).toHaveBeenCalledWith(true);
    });

    it('should set organizer state to false when setAsPlayer event is received', () => {
        service['setAsPlayer']();
        expect(organiserSubjectNextSpy).toHaveBeenCalledWith(false);
    });

    describe('socket event handlers', () => {
        beforeEach(() => {
            service['setUpSocket']();
        });

        it('should update state on updateGameState', () => {
            expect(socketServiceSpy.on).toHaveBeenCalledWith('updateGameState', jasmine.any(Function));

            const callback = socketServiceSpy.on.calls.argsFor(0)[1] as (state: UserGameState) => void;
            callback(UserGameState.Leaderboard);

            expect(userGameStateSubjectNextSpy).toHaveBeenCalledWith(UserGameState.Leaderboard);
        });

        it('should update as organizer on setAsOrganizer', () => {
            expect(socketServiceSpy.on).toHaveBeenCalledWith('setAsOrganizer', jasmine.any(Function));

            const callback = socketServiceSpy.on.calls.argsFor(1)[1] as () => void;
            callback();

            expect(organiserSubjectNextSpy).toHaveBeenCalledWith(true);
        });

        it('should update as player on setAsPlayer', () => {
            expect(socketServiceSpy.on).toHaveBeenCalledWith('setAsPlayer', jasmine.any(Function));

            const callback = socketServiceSpy.on.calls.argsFor(2)[1] as () => void;
            callback();

            expect(organiserSubjectNextSpy).toHaveBeenCalledWith(false);
        });

        it('should reset all behavior subject on kickedOutFromGame', () => {
            expect(socketServiceSpy.on).toHaveBeenCalledWith('kickedOutFromGame', jasmine.any(Function));

            const callback = socketServiceSpy.on.calls.argsFor(3)[1] as () => void;
            callback();

            expect(service['userStateSubject'].getValue()).toEqual(UserGameState.None);
            expect(service['bIsOrganizerSubject'].getValue()).toEqual(false);
        });
    });
});
