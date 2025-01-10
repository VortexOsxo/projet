import { Component, OnDestroy, OnInit } from '@angular/core';
import { Question } from '@common/interfaces/question';
import { GameCurrentQuestionService } from '@app/services/game-services/game-current-question.service';
import { GameOrganiserManagerService } from '@app/services/game-services/game-organiser-manager.service';
import { Observable, Subscription } from 'rxjs';
import { GameMessage } from '@app/enums/game-message';

@Component({
    selector: 'app-organiser-game-view',
    templateUrl: './organiser-game-view.component.html',
    styleUrls: ['./organiser-game-view.component.scss'],
})
export class OrganiserGameViewComponent implements OnDestroy, OnInit {
    questionIndexObserver: Observable<number>;
    buttonName: string;
    private onLastQuestionReachedSubscription: Subscription;

    constructor(
        public gameOrganiserManager: GameOrganiserManagerService,
        private currentQuestionService: GameCurrentQuestionService,
    ) {}

    get numberQuestions(): number {
        return this.gameOrganiserManager.getNumberQuestions();
    }

    get question(): Question {
        return this.currentQuestionService.getCurrentQuestion();
    }

    isNextQuestionButtonActive() {
        return this.gameOrganiserManager.isNextQuestionButtonActive();
    }

    ngOnInit() {
        this.questionIndexObserver = this.gameOrganiserManager.getQuestionIndexObservable();
        this.onLastQuestionReachedSubscription = this.gameOrganiserManager.lastQuestionReached.subscribe(() => this.setButtonName());
        this.setButtonName();
    }

    goToNextQuestion() {
        this.gameOrganiserManager.goToNextQuestion();
    }

    ngOnDestroy() {
        this.onLastQuestionReachedSubscription.unsubscribe();
    }

    private setButtonName() {
        const currentQuestionIndex = this.gameOrganiserManager.getQuestionIndex();
        this.buttonName = currentQuestionIndex + 1 >= this.numberQuestions ? GameMessage.LeaderboardButton : GameMessage.NextquestionButton;
    }
}
