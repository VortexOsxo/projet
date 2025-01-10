import { Component, EventEmitter, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameCountdownComponent } from '@app/components/game-countdown/game-countdown.component';
import { LogoTitleComponent } from '@app/components/logo-title/logo-title.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { GameCurrentQuestionService } from '@app/services/game-services/game-current-question.service';
import { GameOrganiserManagerService } from '@app/services/game-services/game-organiser-manager.service';
import { Question } from '@common/interfaces/question';
import { BehaviorSubject, Subscription } from 'rxjs';
import { OrganiserGameViewComponent } from './organiser-game-view.component';
import { InteractiveTimerComponent } from '@app/components/interactive-timer/interactive-timer.component';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { GameMessage } from '@app/enums/game-message';

@Component({
    selector: 'app-histogram-result',
    template: '<p>Histogramme</p>',
})
class HistogramResultMockComponent {
    @Input() questionHistogram: Question;
    @Input() questionIndex: number;
}

describe('OrganiserGameViewComponent', () => {
    let component: OrganiserGameViewComponent;
    let fixture: ComponentFixture<OrganiserGameViewComponent>;
    let gameOrganiserManagerServiceSpy: jasmine.SpyObj<GameOrganiserManagerService>;
    let gameCurrentQuestionSpy: jasmine.SpyObj<GameCurrentQuestionService>;

    const mockQuestion = { id: '1', points: 10 } as Question;
    const mockQuestionIndexObserver = new BehaviorSubject<number>(0);

    const mockCurrentIndex = 3;
    const mockQuestionNumber = 5;

    beforeEach(() => {
        gameOrganiserManagerServiceSpy = jasmine.createSpyObj('GameOrganiserManagerService', [
            'getQuestionIndexObservable',
            'getNumberQuestions',
            'goToNextQuestion',
            'lastQuestionReached',
            'getQuestionIndex',
            'isNextQuestionButtonActive',
        ]);
        gameOrganiserManagerServiceSpy.lastQuestionReached = new EventEmitter<void>();
        gameOrganiserManagerServiceSpy.getQuestionIndexObservable.and.returnValue(mockQuestionIndexObserver.asObservable());

        gameCurrentQuestionSpy = jasmine.createSpyObj('GameCurrentQuestionService', ['getCurrentQuestion']);
        gameCurrentQuestionSpy.getCurrentQuestion.and.returnValue(mockQuestion);

        TestBed.configureTestingModule({
            declarations: [
                OrganiserGameViewComponent,
                LogoTitleComponent,
                GameCountdownComponent,
                PlayerListComponent,
                HistogramResultMockComponent,
                ChatComponent,
                InteractiveTimerComponent,
            ],
            imports: [FormsModule, MatCardModule, MatDialogModule, MatSnackBarModule],
            providers: [
                { provide: GameOrganiserManagerService, useValue: gameOrganiserManagerServiceSpy },
                { provide: GameCurrentQuestionService, useValue: gameCurrentQuestionSpy },
            ],
        });

        fixture = TestBed.createComponent(OrganiserGameViewComponent);
        component = fixture.componentInstance;
        component['onLastQuestionReachedSubscription'] = new Subscription();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the current question from the game manager component', () => {
        expect(component.question).toEqual(mockQuestion);
    });

    it('should initialize button name and question index observer on init', () => {
        fixture.detectChanges();

        expect(component.buttonName).toEqual(GameMessage.NextquestionButton);
        expect(component.questionIndexObserver).toEqual(mockQuestionIndexObserver.asObservable());
    });

    it('should call goToNextQuestion method of GameOrganiserManagerService when goToNextQuestion is called', () => {
        component.goToNextQuestion();
        expect(gameOrganiserManagerServiceSpy.goToNextQuestion).toHaveBeenCalled();
    });

    it('should update button name when last question is reached', () => {
        fixture.detectChanges();

        gameOrganiserManagerServiceSpy.getQuestionIndex.and.returnValue(mockQuestionNumber - 1);
        gameOrganiserManagerServiceSpy.getNumberQuestions.and.returnValue(mockQuestionNumber);

        gameOrganiserManagerServiceSpy.lastQuestionReached.emit();

        expect(component['buttonName']).toBe(GameMessage.LeaderboardButton);
    });

    it('should unsubscribe from subscriptions on destroy', () => {
        spyOn(component['onLastQuestionReachedSubscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(component['onLastQuestionReachedSubscription'].unsubscribe).toHaveBeenCalled();
    });

    it('should set button name depending on the question index', () => {
        gameOrganiserManagerServiceSpy.getQuestionIndex.and.returnValue(mockCurrentIndex);
        gameOrganiserManagerServiceSpy.getNumberQuestions.and.returnValue(mockQuestionNumber);

        component['setButtonName']();
        expect(component['buttonName']).toEqual(GameMessage.NextquestionButton);

        gameOrganiserManagerServiceSpy.getQuestionIndex.and.returnValue(mockQuestionNumber - 1);

        component['setButtonName']();
        expect(component['buttonName']).toEqual(GameMessage.LeaderboardButton);
    });
});
