import { Injectable } from '@angular/core';
import { Question } from '@common/interfaces/question';
import { GameListenerService } from './base-classes/game-listener.service';
import { NULL_QUESTION } from '@app/consts/game.consts';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';

@Injectable({
    providedIn: 'root',
})
export class GameCurrentQuestionService extends GameListenerService {
    private question: Question;

    getCurrentQuestion(): Question {
        return this.question;
    }

    protected initializeState(): void {
        this.question = NULL_QUESTION;
    }

    protected setUpSocket() {
        this.socketService.on(GamePlaySocketEvent.SendQuestionData, (question: Question) => {
            this.question = question;
        });
    }
}
