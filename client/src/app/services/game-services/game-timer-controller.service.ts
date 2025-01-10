import { Injectable } from '@angular/core';
import { GameListenerService } from './base-classes/game-listener.service';
import { GameTimerSocketEvent } from '@common/enums/socket-event/game-timer-socket-event';
import { BehaviorSubject } from 'rxjs';
import { AudioService } from '@app/services/audio.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { PANIC_SOUND_MP3 } from '@app/consts/file-consts';

@Injectable({
    providedIn: 'root',
})
export class GameTimerControllerService extends GameListenerService {
    private canToggleStopSubject: BehaviorSubject<boolean>;
    private canStartPanicSubject: BehaviorSubject<boolean>;

    constructor(
        socketFactory: SocketFactoryService,
        private audioService: AudioService,
    ) {
        super(socketFactory);
    }

    toggleStop() {
        if (!this.canToggleStopSubject.value) return;
        this.socketService.emit(GameTimerSocketEvent.TogglePause);
    }

    getCanToggleStopObserver() {
        return this.canToggleStopSubject.asObservable();
    }

    togglePanic() {
        if (!this.canStartPanicSubject.value) return;
        this.socketService.emit(GameTimerSocketEvent.StartPanic);
    }

    getCanStartPanicObserver() {
        return this.canStartPanicSubject.asObservable();
    }

    protected initializeState(): void {
        this.canStartPanicSubject = new BehaviorSubject(false);
        this.canToggleStopSubject = new BehaviorSubject(false);
    }

    protected setUpSocket(): void {
        this.socketService.on(GameTimerSocketEvent.CanTogglePause, this.updateCanToggleStop.bind(this));
        this.socketService.on(GameTimerSocketEvent.CanStartPanic, this.updateCanStartPanic.bind(this));
        this.socketService.on(GameTimerSocketEvent.OnPanicModeStarted, this.panicModeStarted.bind(this));
    }

    private updateCanToggleStop(canToggle: boolean) {
        this.canToggleStopSubject.next(canToggle);
    }

    private updateCanStartPanic(canStart: boolean) {
        this.canStartPanicSubject.next(canStart);
    }

    private panicModeStarted() {
        this.audioService.playSound(PANIC_SOUND_MP3);
    }
}
