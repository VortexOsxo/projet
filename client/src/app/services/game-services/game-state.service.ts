import { Injectable } from '@angular/core';
import { UserGameState } from '@common/enums/user-game-state';
import { BehaviorSubject } from 'rxjs';
import { GameListenerService } from './base-classes/game-listener.service';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';

@Injectable({
    providedIn: 'root',
})
export class GameStateService extends GameListenerService {
    private userStateSubject: BehaviorSubject<UserGameState>;
    private bIsOrganizerSubject: BehaviorSubject<boolean>;

    getStateObservable() {
        return this.userStateSubject.asObservable();
    }

    getCurrentState() {
        return this.userStateSubject.value;
    }

    getIsOrganizerObservable() {
        return this.bIsOrganizerSubject.asObservable();
    }

    setState(state: UserGameState) {
        this.userStateSubject.next(state);
    }

    protected setUpSocket() {
        this.socketService.on(GamePlaySocketEvent.UpdateGameState, (state: UserGameState) => {
            this.setState(state);
        });

        this.socketService.on(GamePlaySocketEvent.SetAsOrganizer, () => {
            this.setAsOrganizer();
        });

        this.socketService.on(GamePlaySocketEvent.SetAsPlayer, () => {
            this.setAsPlayer();
        });
    }

    protected initializeState() {
        this.userStateSubject = new BehaviorSubject<UserGameState>(UserGameState.None);
        this.bIsOrganizerSubject = new BehaviorSubject<boolean>(false);
    }

    private setAsOrganizer() {
        this.bIsOrganizerSubject.next(true);
    }

    private setAsPlayer() {
        this.bIsOrganizerSubject.next(false);
    }
}
