import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCorrectedAnswerService } from '@app/services/game-services/game-corrected-answer.service';
import { GameManagerService } from '@app/services/game-services/game-manager.service';
import { Question } from '@common/interfaces/question';
import { AnswerQcmComponent } from './answer-qcm.component';

describe('AnswerQcmComponent', () => {
    let component: AnswerQcmComponent;
    let fixture: ComponentFixture<AnswerQcmComponent>;

    let gameManagerServiceMock: jasmine.SpyObj<GameManagerService>;
    let gameCorrectedAnswerServiceMock: jasmine.SpyObj<GameCorrectedAnswerService>;

    beforeEach(() => {
        gameManagerServiceMock = jasmine.createSpyObj(GameManagerService, ['getCurrentQuestion', 'canSubmitAnswer', 'toggleAnswerChoice']);

        gameManagerServiceMock.getCurrentQuestion.and.returnValue({
            choices: [{ text: 'Choice 1' }, { text: 'Choice 2' }, { text: 'Choice 3' }],
        } as Question);

        gameCorrectedAnswerServiceMock = jasmine.createSpyObj(GameCorrectedAnswerService, ['shouldShowCorrectedAnswer', 'isAnswerCorrected']);

        TestBed.configureTestingModule({
            declarations: [AnswerQcmComponent],
            providers: [
                { provide: GameManagerService, useValue: gameManagerServiceMock },
                { provide: GameCorrectedAnswerService, useValue: gameCorrectedAnswerServiceMock },
            ],
        });
        fixture = TestBed.createComponent(AnswerQcmComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle button when numeric key is pressed', () => {
        spyOn(component, 'toggleButton');
        const event = new KeyboardEvent('keydown', { key: '1' });
        window.dispatchEvent(event);
        expect(component.toggleButton).toHaveBeenCalledWith(0);
    });

    it('should not toggle button when inactive button is pressed', () => {
        spyOn(component, 'toggleButton');
        const event = new KeyboardEvent('keydown', { key: 'A' });
        window.dispatchEvent(event);
        expect(component.toggleButton).not.toHaveBeenCalled();
    });

    it('should toggle button selection and check if check if button is active', () => {
        gameManagerServiceMock.canSubmitAnswer.and.returnValue(true);
        component.toggleButton(0);
        expect(component['selectedAnswers']).toContain(0);
        expect(component.isButtonActive(0)).toBeTruthy();
        component.toggleButton(0);
        expect(component['selectedAnswers']).not.toContain(0);
        expect(component.isButtonActive(0)).toBeFalsy();
    });

    it('should not toggle button, if can not submit', () => {
        gameManagerServiceMock.canSubmitAnswer.and.returnValue(false);
        component.toggleButton(0);
        expect(component['selectedAnswers']).not.toContain(0);
    });

    it('should check if button is corrected', () => {
        gameCorrectedAnswerServiceMock.isAnswerCorrected.and.returnValue(true);
        expect(component.isButtonCorrected(0)).toBeTruthy();
    });

    it('can submit answer', () => {
        gameManagerServiceMock.canSubmitAnswer.and.returnValue(false);

        expect(component.canSubmitAnswer()).toEqual(false);
        expect(gameManagerServiceMock.canSubmitAnswer).toHaveBeenCalled();
    });

    it('should not toggle button when key is pressed in INPUT or TEXTAREA', () => {
        spyOn(component, 'toggleButton').and.callThrough();

        const inputElement = document.createElement('input');
        const inputEvent = new KeyboardEvent('keydown', { key: '1' });
        Object.defineProperty(inputEvent, 'target', { value: inputElement, enumerable: true });
        component.buttonDetect(inputEvent);
        expect(component.toggleButton).not.toHaveBeenCalled();

        const textareaElement = document.createElement('textarea');
        const textareaEvent = new KeyboardEvent('keydown', { key: '1' });
        Object.defineProperty(textareaEvent, 'target', { value: textareaElement, enumerable: true });
        component.buttonDetect(textareaEvent);
        expect(component.toggleButton).not.toHaveBeenCalled();
    });
});
