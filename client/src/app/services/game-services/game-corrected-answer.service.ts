import { Injectable } from '@angular/core';
import { GameListenerService } from './base-classes/game-listener.service';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';

@Injectable({
    providedIn: 'root',
})
export class GameCorrectedAnswerService extends GameListenerService {
    private correctAnswer: number[] = [];
    private showCorrectAnswer: boolean = false;

    shouldShowCorrectedAnswer(): boolean {
        return this.showCorrectAnswer;
    }

    isAnswerCorrected(answerIndex: number) {
        return this.showCorrectAnswer && this.correctAnswer.includes(answerIndex);
    }

    protected setUpSocket() {
        this.socketService.on(GamePlaySocketEvent.SendQuestionData, () => {
            this.initializeState();
        });

        this.socketService.on(GameAnswerSocketEvent.SendCorrectAnswer, (answersIndex: number[]) => {
            this.correctAnswer = answersIndex;
            this.showCorrectAnswer = true;
        });
    }

    protected initializeState(): void {
        this.showCorrectAnswer = false;
        this.correctAnswer = [];
    }
}
