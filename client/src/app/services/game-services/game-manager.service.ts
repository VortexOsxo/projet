import { Injectable } from '@angular/core';
import { Question } from '@common/interfaces/question';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { Router } from '@angular/router';
import { GameListenerService } from './base-classes/game-listener.service';
import { GameCurrentQuestionService } from './game-current-question.service';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';

@Injectable({
    providedIn: 'root',
})
export class GameManagerService extends GameListenerService {
    private hasSubmitedAnswer: boolean = false;
    private currentScoreSubject = new BehaviorSubject<number>(0);

    constructor(
        socketFactory: SocketFactoryService,
        private gameCurrentQuestionService: GameCurrentQuestionService,
        private router: Router,
    ) {
        super(socketFactory);
    }

    getCurrentQuestion(): Question {
        return this.gameCurrentQuestionService.getCurrentQuestion();
    }

    getCurrentScoreObservable(): Observable<number> {
        return this.currentScoreSubject.asObservable();
    }

    canSubmitAnswer(): boolean {
        return !this.hasSubmitedAnswer;
    }

    updateHasSubmitedAnswer(hasSubmitedAnswer: boolean) {
        this.hasSubmitedAnswer = hasSubmitedAnswer;
    }

    submitAnswers() {
        this.hasSubmitedAnswer = true;
        this.socketService.emit(GameAnswerSocketEvent.SubmitAnswer);
    }

    toggleAnswerChoice(index: number) {
        // Because of some error in the transfer when sending 0 when shift by one during the transfer
        this.socketService.emit(GameAnswerSocketEvent.ToggleAnswerChoices, index + 1);
    }

    updateAnswerResponse(updatedResponse: string) {
        this.socketService.emit(GameAnswerSocketEvent.UpdateAnswerResponse, updatedResponse);
    }

    protected setUpSocket() {
        this.socketService.on(GamePlaySocketEvent.SendQuestionData, () => this.updateHasSubmitedAnswer(false));

        this.socketService.on(GamePlayerSocketEvent.SendPlayerScore, (updatedScore: number) => {
            this.currentScoreSubject.next(updatedScore);
        });

        this.socketService.on(GamePlaySocketEvent.FinishedTestGame, () => {
            this.router.navigate(['/game-creation']);
        });

        this.socketService.on(GameAnswerSocketEvent.AnswerCollected, () => this.updateHasSubmitedAnswer(true));
    }

    protected initializeState(): void {
        this.currentScoreSubject = new BehaviorSubject<number>(0);
    }
}
