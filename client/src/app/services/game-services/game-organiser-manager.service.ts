import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { GameInfoService } from './game-info.service';
import { GameListenerService } from './base-classes/game-listener.service';
import { GameManagementSocketEvent } from '@common/enums/socket-event/game-management-socket-event';

@Injectable({
    providedIn: 'root',
})
export class GameOrganiserManagerService extends GameListenerService {
    lastQuestionReached: EventEmitter<void>;
    private canGoToNextQuestion: boolean;
    private currentQuestionIndex: BehaviorSubject<number>;

    constructor(
        socketFactory: SocketFactoryService,
        private gameInfoService: GameInfoService,
    ) {
        super(socketFactory);
    }

    private get quizPlaying() {
        return this.gameInfoService.getQuiz();
    }

    isNextQuestionButtonActive() {
        return this.canGoToNextQuestion;
    }

    goToNextQuestion() {
        this.canGoToNextQuestion = false;
        this.socketService.emit(GameManagementSocketEvent.NextQuestion);
        this.updateIndex();
    }

    getNumberQuestions(): number {
        return this.quizPlaying.questions.length;
    }

    getQuestionIndexObservable(): Observable<number> {
        return this.currentQuestionIndex.asObservable();
    }

    getQuestionIndex(): number {
        return this.currentQuestionIndex.value;
    }

    protected initializeState(): void {
        this.canGoToNextQuestion = false;
        this.lastQuestionReached = new EventEmitter();
        this.currentQuestionIndex = new BehaviorSubject(0);
    }

    protected setUpSocket(): void {
        this.socketService.on(GameManagementSocketEvent.CanGoToNextQuestion, () => (this.canGoToNextQuestion = true));
    }

    private updateIndex() {
        const newIndex = Math.min(this.currentQuestionIndex.value + 1, this.getNumberQuestions() - 1);
        this.currentQuestionIndex.next(newIndex);
        if (newIndex + 1 === this.getNumberQuestions()) this.lastQuestionReached.emit();
    }
}
