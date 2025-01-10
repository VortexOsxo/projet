import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArrayHelperService } from '@app/services/array-helper.service';
import { QuestionModificationQCMComponent } from './question-modification-qcm.component';
import { Question } from '@common/interfaces/question';
import { FormsModule } from '@angular/forms';
import { Choice } from '@common/interfaces/choice';
import { QuestionType } from '@common/enums/question-type';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QuestionService } from '@app/services/question-services/question.service';
import { QuestionValidationService } from '@app/services/question-services/question-validation.service';
import { LogoTitleComponent } from '@app/components/logo-title/logo-title.component';

describe('QuestionModificationQCMComponent', () => {
    let component: QuestionModificationQCMComponent;
    let fixture: ComponentFixture<QuestionModificationQCMComponent>;
    let arrayHelperService: ArrayHelperService;

    const index1 = 0;
    const index2 = 5;
    let testQuestion: Question;
    let testQuestion2: Question;
    let testChoices: Choice[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionModificationQCMComponent, LogoTitleComponent],
            imports: [FormsModule, MatDialogModule, MatIconModule, HttpClientTestingModule],
            providers: [ArrayHelperService, QuestionService],
        });

        testQuestion = {
            id: '0',
            text: 'testQuestion',
            type: QuestionType.QCM,
            points: 40,
            choices: [],
            lastModification: new Date(),
        };

        testQuestion2 = {
            id: '1',
            text: 'testQuestion2',
            type: QuestionType.QCM,
            points: 20,
            choices: [],
            lastModification: new Date(),
        };

        testChoices = [
            {
                text: '1',
                isCorrect: true,
            },
            {
                text: '2',
                isCorrect: false,
            },
            {
                text: 'a',
                isCorrect: true,
            },
            {
                text: '5',
                isCorrect: false,
            },
        ];

        fixture = TestBed.createComponent(QuestionModificationQCMComponent);
        arrayHelperService = TestBed.inject(ArrayHelperService);
        TestBed.inject(QuestionService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize question if not already set', () => {
        const questionServiceSpy = jasmine.createSpyObj<QuestionService>('QuestionService', ['createVoidQCMQuestion']);
        questionServiceSpy.createVoidQCMQuestion.and.returnValue(testQuestion2);

        component = new QuestionModificationQCMComponent({} as QuestionValidationService, questionServiceSpy, {} as ArrayHelperService);

        component.ngOnInit();

        expect(questionServiceSpy.createVoidQCMQuestion).toHaveBeenCalled();
        expect(component.question).toEqual(testQuestion2);
    });

    it('move choice should properly call swapElement', () => {
        const swapElementSpy = spyOn(arrayHelperService, 'swapElement').and.callThrough();

        component.moveChoice(index1, index2);

        expect(swapElementSpy).toHaveBeenCalledWith(component.question.choices as Choice[], index1, index2);
    });

    it('deleteChoice should properly call deleteElement if we have more than two choice', () => {
        const deleteElementSpy = spyOn(arrayHelperService, 'deleteElement').and.callThrough();

        component.question = testQuestion;
        component.question.choices = testChoices;

        component.deleteChoice(index1);

        expect(deleteElementSpy).toHaveBeenCalledWith(component.question.choices, index1);
    });

    it('deleteChoice should not call deleteElement if we have less than three choice', () => {
        const deleteElementSpy = spyOn(arrayHelperService, 'deleteElement').and.callThrough();
        component.deleteChoice(index1);
        expect(deleteElementSpy).not.toHaveBeenCalled();
    });

    it('should add a choice to the question if there is less than 4 choice', () => {
        component.question = testQuestion;
        const expectedLenght = component.question.choices.length + 1;
        component.addChoice();
        expect(component.question.choices.length).toEqual(expectedLenght);
    });

    it('should  not add a choice to the question if there is 4 choice', () => {
        component.question = testQuestion;
        component.question.choices = testChoices;
        component.addChoice();
        expect(component.question.choices).toEqual(testChoices);
    });

    it('OnInnit should not modify question if already defined', () => {
        const mockQuestion = { text: 'mockQuestion' } as Question;
        component['question'] = mockQuestion;

        component.ngOnInit();

        expect(component['question']).toBe(mockQuestion);
    });
});
