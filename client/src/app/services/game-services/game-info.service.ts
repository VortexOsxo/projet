import { Injectable } from '@angular/core';
import { NULL_QUIZ } from '@app/consts/game.consts';
import { GameInfo } from '@common/interfaces/game-info';
import { Quiz } from '@common/interfaces/quiz';
import { BehaviorSubject } from 'rxjs';
import { GameListenerService } from './base-classes/game-listener.service';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';
import { GameType } from '@common/enums/game-type';

@Injectable({
    providedIn: 'root',
})
export class GameInfoService extends GameListenerService {
    private gameIdSubject: BehaviorSubject<number>;
    private quizSubject: BehaviorSubject<Quiz>;
    private usernameSubject: BehaviorSubject<string>;
    private gameTypeSubject: BehaviorSubject<GameType>;

    getGameId() {
        return this.gameIdSubject.value;
    }

    getGameIdObservable() {
        return this.gameIdSubject.asObservable();
    }
    getQuizObservable() {
        return this.quizSubject.asObservable();
    }

    getQuiz() {
        return this.quizSubject.value;
    }

    getUsername() {
        return this.usernameSubject.value;
    }

    getUsernameObservable() {
        return this.usernameSubject.asObservable();
    }

    setUsername(newUsername: string) {
        this.usernameSubject.next(newUsername);
    }

    getGameType() {
        return this.gameTypeSubject.value;
    }

    protected setUpSocket() {
        this.socketService.on(GamePlaySocketEvent.SendGameInfo, (gameInfo: GameInfo) => {
            this.updateGameInfo(gameInfo);
        });
    }

    protected initializeState() {
        this.gameTypeSubject ??= new BehaviorSubject<GameType>(GameType.LobbyGame);
        this.gameTypeSubject.next(GameType.LobbyGame);

        this.gameIdSubject ??= new BehaviorSubject<number>(0);
        this.gameIdSubject.next(0);

        this.quizSubject ??= new BehaviorSubject(NULL_QUIZ);
        this.quizSubject.next(NULL_QUIZ);

        this.usernameSubject ??= new BehaviorSubject<string>('');
        this.usernameSubject.next('');
    }

    private updateGameInfo(gameInfo: GameInfo) {
        this.gameIdSubject.next(gameInfo.gameId);
        this.quizSubject.next(gameInfo.quizToPlay);
        this.gameTypeSubject.next(gameInfo.gameType);
    }
}
