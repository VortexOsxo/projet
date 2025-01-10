import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerQrlComponent } from './answer-qrl.component';
import { GameManagerService } from '@app/services/game-services/game-manager.service';
import { FormsModule } from '@angular/forms';

describe('AnswerQrlComponent', () => {
    let component: AnswerQrlComponent;
    let fixture: ComponentFixture<AnswerQrlComponent>;
    let gameManagerMock: jasmine.SpyObj<GameManagerService>;

    beforeEach(async () => {
        gameManagerMock = jasmine.createSpyObj('GameManagerService', ['canSubmitAnswer', 'updateAnswerResponse']);

        await TestBed.configureTestingModule({
            declarations: [AnswerQrlComponent],
            providers: [{ provide: GameManagerService, useValue: gameManagerMock }],
            imports: [FormsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AnswerQrlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('canSubmitAnswer', () => {
        it('should call gameManager.canSubmitAnswer', () => {
            component.canSubmitAnswer();
            expect(gameManagerMock.canSubmitAnswer).toHaveBeenCalled();
        });
    });

    describe('onTextModified', () => {
        it('should call gameManager.updateAnswerResponse with the updated longAnswer', () => {
            const updatedAnswer = 'Updated answer';
            component.longAnswer = updatedAnswer;
            component.onTextModified();
            expect(gameManagerMock.updateAnswerResponse).toHaveBeenCalledWith(updatedAnswer);
        });
    });
});
