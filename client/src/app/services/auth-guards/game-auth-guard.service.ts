import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '@app/services/game-services/game-state.service';
import { UserGameState } from '@common/enums/user-game-state';

@Injectable({
    providedIn: 'root',
})
export class GameAuthGuardService {
    constructor(
        private readonly gameStateService: GameStateService,
        private readonly router: Router,
    ) {}

    canActivate() {
        const isAuthenticated = this.gameStateService.getCurrentState() !== UserGameState.None;
        if (!isAuthenticated) this.router.navigate(['/home']);
        return isAuthenticated;
    }
}
