import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameStateService } from '@app/services/game-services/game-state.service';
import { UserGameState } from '@common/enums/user-game-state';
import { HttpClientModule } from '@angular/common/http';
import { GameAuthGuardService } from './game-auth-guard.service';

describe('GameAuthGuardService', () => {
    let service: GameAuthGuardService;
    let gameStateService: jasmine.SpyObj<GameStateService>;
    let routerServiceMock: jasmine.SpyObj<Router>;

    beforeEach(() => {
        gameStateService = jasmine.createSpyObj(GameStateService, ['getCurrentState']);
        routerServiceMock = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: GameStateService, useValue: gameStateService },
                { provide: Router, useValue: routerServiceMock },
            ],
            imports: [HttpClientModule],
        });
        service = TestBed.inject(GameAuthGuardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('the canActivate method should true only if the user is in a game state', () => {
        it('should return true if the user is in a game state', () => {
            gameStateService.getCurrentState.and.returnValue(UserGameState.InGame);
            const result = service.canActivate();

            expect(gameStateService.getCurrentState).toHaveBeenCalled();
            expect(result).toBeTrue();
        });

        it('should return false if user is not in a game state', () => {
            gameStateService.getCurrentState.and.returnValue(UserGameState.None);
            const result = service.canActivate();

            expect(gameStateService.getCurrentState).toHaveBeenCalled();
            expect(result).toBeFalse();
        });
    });

    describe('the canActivate method should redirect only if the user is not in a game state', () => {
        const redirectPath = '/home';

        it('should redirect to home if the user is not in a game state', () => {
            gameStateService.getCurrentState.and.returnValue(UserGameState.None);
            service.canActivate();

            expect(routerServiceMock.navigate).toHaveBeenCalledWith([redirectPath]);
        });

        it('the canActivate method should not redirect if the user is in a game state', () => {
            gameStateService.getCurrentState.and.returnValue(UserGameState.InGame);
            service.canActivate();

            expect(routerServiceMock.navigate).not.toHaveBeenCalled();
        });
    });
});
