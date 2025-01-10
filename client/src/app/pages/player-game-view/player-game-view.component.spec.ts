import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AnswerQcmComponent } from '@app/components/answer/answer-qcm/answer-qcm.component';
import { AnswerQrlComponent } from '@app/components/answer/answer-qrl/answer-qrl.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameCountdownComponent } from '@app/components/game-countdown/game-countdown.component';
import { LogoTitleComponent } from '@app/components/logo-title/logo-title.component';
import { GameCorrectedAnswerService } from '@app/services/game-services/game-corrected-answer.service';
import { GameManagerService } from '@app/services/game-services/game-manager.service';
import { QuestionType } from '@common/enums/question-type';
import { Question } from '@common/interfaces/question';
import { Observable, of } from 'rxjs';
import { PlayerGameViewComponent } from './player-game-view.component';

describe('PlayerGameViewComponent', () => {
    let component: PlayerGameViewComponent;
    let fixture: ComponentFixture<PlayerGameViewComponent>;
    let gameManagerServiceMock: jasmine.SpyObj<GameManagerService>;
    let gameCorrectedAnswerServiceMock: jasmine.SpyObj<GameCorrectedAnswerService>;
    let matSnackBarMock: jasmine.SpyObj<MatSnackBar>;

    beforeEach(async () => {
        gameManagerServiceMock = jasmine.createSpyObj('GameManagerService', [
            'getCurrentScoreObservable',
            'registerAsPlayer',
            'getCurrentQuestion',
            'canSubmitAnswer',
            'resetAnsweredState',
            'unregisterAsPlayer',
            'submitAnswers',
            'toggleAnswerChoice',
        ]);

        gameCorrectedAnswerServiceMock = jasmine.createSpyObj('GameCorrectedAnswerService', ['shouldShowCorrectedAnswer', 'isAnswerCorrected']);

        matSnackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

        gameManagerServiceMock.getCurrentScoreObservable.and.returnValue(of(0));
        gameManagerServiceMock.getCurrentQuestion.and.returnValue({
            choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }, { text: 'Choice 3' }],
        } as Question);

        await TestBed.configureTestingModule({
            declarations: [
                PlayerGameViewComponent,
                GameCountdownComponent,
                LogoTitleComponent,
                ChatComponent,
                AnswerQcmComponent,
                AnswerQrlComponent,
            ],
            providers: [
                { provide: GameManagerService, useValue: gameManagerServiceMock },
                { provide: GameCorrectedAnswerService, useValue: gameCorrectedAnswerServiceMock },
                { provide: MatSnackBar, useValue: matSnackBarMock },
            ],
            imports: [FormsModule, MatDialogModule],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerGameViewComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to current score observable on init', () => {
        expect(gameManagerServiceMock.getCurrentScoreObservable).toHaveBeenCalled();
        expect(component.currentScoreObserver).toBeInstanceOf(Observable);
    });

    it('should get current question on init', () => {
        expect(gameManagerServiceMock.getCurrentQuestion).toHaveBeenCalled();
        expect(component.question).toBeTruthy();
    });

    it('should call submitAnswer when submitButtonHandler is called', () => {
        spyOn(component as unknown as { submitAnswer: () => void }, 'submitAnswer');
        component.submitButtonHandler();
        expect(component['submitAnswer']).toHaveBeenCalled();
    });

    it('should check if answer can be submitted', () => {
        gameManagerServiceMock.canSubmitAnswer.and.returnValue(true);
        expect(component.canSubmitAnswer()).toBeTruthy();
    });

    it('should call submitAnswers when submitAnswer is called', () => {
        component['submitAnswer']();
        expect(gameManagerServiceMock.submitAnswers).toHaveBeenCalled();
    });

    it('should open snackbar when submitButtonHandler is called', () => {
        gameManagerServiceMock.canSubmitAnswer.and.returnValue(true);
        component.submitButtonHandler();
        expect(matSnackBarMock.open).toHaveBeenCalled();
    });

    it('should call submitAnswer when enter key is pressed and question is a QCM', fakeAsync(() => {
        component['question'] = { type: QuestionType.QCM } as Question;
        spyOn(component, 'submitButtonHandler');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(event);
        tick();
        expect(component.submitButtonHandler).toHaveBeenCalled();
    }));

    it('should not call submitAnswer when enter key is pressed and question is a QRL', fakeAsync(() => {
        component['question'] = { type: QuestionType.QRL } as Question;
        spyOn(component, 'submitButtonHandler');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(event);
        tick();
        expect(component.submitButtonHandler).not.toHaveBeenCalled();
    }));

    it('should not call submitAnswer a key different which is not enter is pressed', fakeAsync(() => {
        spyOn(component, 'submitButtonHandler');
        const event = new KeyboardEvent('keydown', { key: 'Space' });
        window.dispatchEvent(event);
        tick();
        expect(component.submitButtonHandler).not.toHaveBeenCalled();
    }));

    it('should not open snackbar when submitButtonHandler is called and answer cannot be submitted', () => {
        gameManagerServiceMock.canSubmitAnswer.and.returnValue(false);

        component['openSubmitConfirmationSnackBar']();
        expect(matSnackBarMock.open).not.toHaveBeenCalled();
    });

    it('should not call submitButtonHandler when enter key is pressed in INPUT or TEXTAREA', () => {
        spyOn(component, 'submitButtonHandler');

        const inputElement = document.createElement('input');
        const inputEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        Object.defineProperty(inputEvent, 'target', { value: inputElement, enumerable: true });
        window.dispatchEvent(inputEvent);
        expect(component.submitButtonHandler).not.toHaveBeenCalled();

        const textareaElement = document.createElement('textarea');
        const textareaEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        Object.defineProperty(textareaEvent, 'target', { value: textareaElement, enumerable: true });
        window.dispatchEvent(textareaEvent);
        expect(component.submitButtonHandler).not.toHaveBeenCalled();
    });
});
