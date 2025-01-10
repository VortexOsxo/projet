import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { LocalQuestionBankComponent } from '@app/components/local-question-bank/local-question-bank.component';
import { LogoTitleComponent } from '@app/components/logo-title/logo-title.component';
import { InformationModalComponent } from '@app/components/modal/information-modal/information-modal.component';
import { QuestionModificationQCMComponent } from '@app/components/question-components/modification/qcm/question-modification-qcm.component';
import { QuestionType } from '@common/enums/question-type';
import { Question } from '@common/interfaces/question';
import { Quiz } from '@common/interfaces/quiz';
import { ArrayHelperService } from '@app/services/array-helper.service';
import { QuizValidationService } from '@app/services/quiz-services/quiz-validation.service';
import { QuizCreationPageComponent } from './quiz-creation-page.component';
import { InputValidity } from '@app/interfaces/input-validity';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';

@Component({
    selector: 'app-question-filter',
    template: '',
})
export class MockQuestionFilterComponent {}

const testQuestions: Question[] = [
    {
        id: '0',
        text: '1',
        type: QuestionType.QCM,
        points: 10,
        choices: [],
        lastModification: new Date(),
    },
    {
        id: '1',
        text: '2',
        type: QuestionType.QCM,
        points: 10,
        choices: [],
        lastModification: new Date(),
    },
];

const testQuiz: Quiz = {
    id: '1',
    title: 'b',
    description: 'a',
    duration: 40,
    lastModification: new Date(),
    questions: [],
    isVisible: true,
};

const index1 = 0;
const index2 = 1;

describe('QuizCreationPageComponent', () => {
    let component: QuizCreationPageComponent;
    let fixture: ComponentFixture<QuizCreationPageComponent>;
    let arrayHelperService: ArrayHelperService;
    let dialog: MatDialog;

    const validationServiceSpy = jasmine.createSpyObj<QuizValidationService>('QuizValidationService', [
        'validateAnswerTime',
        'validateQuizName',
        'validateQuizDescription',
        'validateQuiz',
        'attemptSubmit',
        'getQuizToModify',
    ]);
    validationServiceSpy.getQuizToModify.and.returnValue(null);

    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    const fakeReturn: InputValidity = {
        isValid: true,
        errorMessage: '',
    };

    validationServiceSpy.validateAnswerTime.and.returnValue(fakeReturn);
    validationServiceSpy.validateQuizName.and.returnValue(fakeReturn);
    validationServiceSpy.validateQuizDescription.and.returnValue(fakeReturn);

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                QuizCreationPageComponent,
                LogoTitleComponent,
                QuestionModificationQCMComponent,
                LocalQuestionBankComponent,
                MockQuestionFilterComponent,
            ],
            imports: [MatDialogModule, FormsModule, HttpClientModule, MatIconModule, MatListModule, MatCardModule, MatButtonModule],
            providers: [
                { provide: QuizValidationService, useValue: validationServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ArrayHelperService },
            ],
        });

        fixture = TestBed.createComponent(QuizCreationPageComponent);
        component = fixture.componentInstance;
        arrayHelperService = TestBed.inject(ArrayHelperService);
        dialog = TestBed.inject(MatDialog);

        fixture.detectChanges();
    });

    describe('initialization', () => {
        it('should use the quiz from validationService', () => {
            validationServiceSpy.getQuizToModify.and.returnValue(testQuiz);

            component.ngOnInit();

            expect(component).toBeTruthy();
            expect(component.quiz).toEqual(testQuiz);
        });

        it('should use a default quiz if the quiz to modify from validation service isnt defined', () => {
            component.ngOnInit();

            expect(component).toBeTruthy();
            expect(component.quiz).toBeDefined();
        });
    });

    describe('Should use QuizValidationService to validate input', () => {
        it('validate answer time', () => {
            validationServiceSpy.validateAnswerTime.and.returnValue(fakeReturn);

            expect(validationServiceSpy.validateAnswerTime).toHaveBeenCalledWith(component.quiz.duration);
        });

        it('validate name', () => {
            validationServiceSpy.validateQuizName.and.returnValue(fakeReturn);

            expect(validationServiceSpy.validateQuizName).toHaveBeenCalledWith(component.quiz.title, component.quiz.id);
        });

        it('validate description', () => {
            validationServiceSpy.validateQuizDescription.and.returnValue(fakeReturn);

            expect(validationServiceSpy.validateQuizDescription).toHaveBeenCalledWith(component.quiz.description);
        });
    });

    it('should open a dialog to inform client of error if the quiz is not valid', () => {
        const mockErrorMessage = 'mockError';
        validationServiceSpy.attemptSubmit.and.returnValue({ isValid: false, errorMessage: mockErrorMessage });

        const dialogOpenSpy = spyOn(dialog, 'open').and.stub();

        component.submitQuiz();

        expect(dialogOpenSpy).toHaveBeenCalledWith(InformationModalComponent, { data: mockErrorMessage });
    });

    it('deleteChoice should properly call deleteElement', () => {
        const deleteElementSpy = spyOn(arrayHelperService, 'deleteElement').and.callThrough();

        component.quiz.questions = testQuestions;

        component.deleteQuestion(index1);

        expect(deleteElementSpy).toHaveBeenCalledWith(component.quiz.questions, index1);
    });

    it('should add selected questions to the quiz', () => {
        const testQuestion = { id: '3', text: 'Question 3', lastModification: new Date(), points: 10, type: QuestionType.QCM, choices: [] };
        const addedQuestions = [
            { id: '4', text: 'Question 4', lastModification: new Date(), points: 15, type: QuestionType.QCM, choices: [] },
            { id: '5', text: 'Question 5', lastModification: new Date(), points: 15, type: QuestionType.QCM, choices: [] },
        ];
        component['quiz'].questions = [testQuestion];

        component.addQuestionsToQuiz(addedQuestions);

        expect(component['quiz'].questions).toEqual([testQuestion, ...addedQuestions]);
    });

    it('should only add the questions which are not already in the quiz', () => {
        const testQuestion = { id: '3', text: 'Question 3', lastModification: new Date(), points: 10, type: QuestionType.QCM, choices: [] };
        const addedQuestions = [
            { id: '4', text: 'Question 4', lastModification: new Date(), points: 15, type: QuestionType.QCM, choices: [] },
            { id: '5', text: 'Question 5', lastModification: new Date(), points: 15, type: QuestionType.QCM, choices: [] },
            testQuestion,
        ];
        component['quiz'].questions = [testQuestion];

        component.addQuestionsToQuiz(addedQuestions);

        expect(component['quiz'].questions).toEqual([testQuestion, addedQuestions[0], addedQuestions[1]]);
    });

    it('should add a question to the quiz', () => {
        component.quiz.questions = [];

        component.addQCMQuestion();
        expect(component.quiz.questions.length).toEqual(1);
        expect(component.quiz.questions[0].type).toBe(QuestionType.QCM);

        component.addQRLQuestion();
        expect(component.quiz.questions.length).toEqual(2);
        expect(component.quiz.questions[1].type).toBe(QuestionType.QRL);
    });

    it('moveQuestion should call swap element with the questions array and the right index', () => {
        const swapElementSpy = spyOn(arrayHelperService, 'swapElement').and.callThrough();

        component.moveQuestion(index1, index2);

        expect(swapElementSpy).toHaveBeenCalledWith(component.quiz.questions, index1, index2);
    });

    it('if the quiz is valid, submiting should add the quiz with the quiz service and redirect', () => {
        validationServiceSpy.attemptSubmit.and.returnValue({ isValid: true, errorMessage: '' });
        component.submitQuiz();

        expect(validationServiceSpy.attemptSubmit).toHaveBeenCalledWith(component.quiz);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
    });
});
