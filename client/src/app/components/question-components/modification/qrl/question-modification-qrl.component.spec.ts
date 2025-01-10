import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionModificationQrlComponent } from './question-modification-qrl.component';
import { QuestionValidationService } from '@app/services/question-services/question-validation.service';
import { QuestionService } from '@app/services/question-services/question.service';
import { VOID_QCM_QUESTION } from '@app/consts/question.consts';
import { FormsModule } from '@angular/forms';

describe('QuestionModificationQrlComponent', () => {
    let component: QuestionModificationQrlComponent;
    let fixture: ComponentFixture<QuestionModificationQrlComponent>;

    const questionValidationServiceMock = jasmine.createSpyObj('QuestionValidationService', {
        validateQuestionPoints: { isValid: true, errorMessage: '' },
        validateName: { isValid: true, errorMessage: '' },
    });

    const questionServiceMock = jasmine.createSpyObj('QuestionService', ['createVoidQCMQuestion', 'addQuestion']);
    questionServiceMock.createVoidQCMQuestion.and.returnValue(VOID_QCM_QUESTION);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [QuestionModificationQrlComponent],
            providers: [
                { provide: QuestionValidationService, useValue: questionValidationServiceMock },
                { provide: QuestionService, useValue: questionServiceMock },
            ],
            imports: [FormsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionModificationQrlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set question to void question if not provided', () => {
        component.ngOnInit();

        expect(questionServiceMock.createVoidQCMQuestion).toHaveBeenCalled();
        expect(component.question).toEqual(questionServiceMock.createVoidQCMQuestion());
    });
});
