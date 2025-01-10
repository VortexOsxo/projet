import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizerCorrectionComponent } from './organizer-correction.component';
import { GameAnswerCorrectionService } from '@app/services/game-services/game-answer-correction.service';
import { EventEmitter } from '@angular/core';
import { AnswerToCorrect } from '@common/interfaces/answers/answer-to-correct';
import { MatCardModule } from '@angular/material/card';

describe('OrganizerCorrectionComponent', () => {
    let component: OrganizerCorrectionComponent;
    let fixture: ComponentFixture<OrganizerCorrectionComponent>;
    let gameAnswerCorrectionMock: jasmine.SpyObj<GameAnswerCorrectionService>;

    const mockAnswer: AnswerToCorrect = { playerName: 'player1', score: 0, answer: 'answer1' };

    beforeEach(async () => {
        gameAnswerCorrectionMock = jasmine.createSpyObj('GameAnswerCorrectionService', ['getAnswer', 'scoreAnswer']);
        gameAnswerCorrectionMock.answerToCorrectUpdated = new EventEmitter();
        gameAnswerCorrectionMock.getAnswer.and.returnValue(mockAnswer);

        await TestBed.configureTestingModule({
            declarations: [OrganizerCorrectionComponent],
            providers: [{ provide: GameAnswerCorrectionService, useValue: gameAnswerCorrectionMock }],
            imports: [MatCardModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganizerCorrectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call gameAnswerCorrection.scoreAnswer with provided score', () => {
        const score = 10;
        component.scoreAnswer(score);
        expect(gameAnswerCorrectionMock.scoreAnswer).toHaveBeenCalledWith(score);
    });

    it('should update answer on answerToCorrectUpdated event', () => {
        component.answer = undefined as unknown as AnswerToCorrect;

        gameAnswerCorrectionMock.answerToCorrectUpdated.emit();

        expect(component.answer).toEqual(mockAnswer);
    });
});
