import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { QuestionsComponent } from './questions.component';
import { QuestionService } from '@app/services/question-services/question.service';
import { Question } from '@common/interfaces/question';
import { QuestionFormComponent } from '@app/components/question-components/question-form/question-form.component';
import { QuestionType } from '@common/enums/question-type';
import { HttpClientModule } from '@angular/common/http';
import { LogoTitleComponent } from '@app/components/logo-title/logo-title.component';
import { VOID_QCM_QUESTION, VOID_QRL_QUESTION } from '@app/consts/question.consts';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';

@Component({
    selector: 'app-question-filter',
    template: '',
})
export class MockQuestionFilterComponent {}

describe('QuestionsComponent', () => {
    let component: QuestionsComponent;
    let fixture: ComponentFixture<QuestionsComponent>;
    let questionServiceSpy: jasmine.SpyObj<QuestionService>;
    let mockQuestionsBehaviorSubject: BehaviorSubject<Question[]>;
    let dialog: MatDialog;

    const testQuestions: Question[] = [
        { id: '1', text: 'Question 1', lastModification: new Date(), points: 10, type: QuestionType.QCM, choices: [] },
        { id: '2', text: 'Question 2', lastModification: new Date(), points: 15, type: QuestionType.QCM, choices: [] },
    ];

    beforeEach(waitForAsync(() => {
        mockQuestionsBehaviorSubject = new BehaviorSubject([] as Question[]);
        questionServiceSpy = jasmine.createSpyObj(QuestionService, ['getQuestions', 'updateQuestion', 'deleteQuestion', 'removeFilter']);
        questionServiceSpy.questionsObservable = mockQuestionsBehaviorSubject.asObservable();

        TestBed.configureTestingModule({
            declarations: [QuestionsComponent, LogoTitleComponent, MockQuestionFilterComponent],
            imports: [MatDialogModule, HttpClientModule, HttpClientTestingModule, MatCardModule, MatButtonModule],
            providers: [{ provide: QuestionService, useValue: questionServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionsComponent);
        component = fixture.componentInstance;
        dialog = TestBed.inject(MatDialog);

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with an empty questions array', () => {
        expect(component.questions).toEqual([]);
    });

    it('should properly subscribe to the questions on ngOnInit', () => {
        component.ngOnInit();
        mockQuestionsBehaviorSubject.next(testQuestions);

        expect(component.questions).toEqual(testQuestions);
    });

    it('should update questions array on getQuestions method', () => {
        questionServiceSpy.getQuestions.and.returnValue(testQuestions);

        component.getQuestions();

        expect(component.questions).toEqual(testQuestions);
    });

    it('should open edit dialog and update question on dialog close', () => {
        const sampleQuestion: Question = {
            id: '1',
            text: 'Updated Question',
            lastModification: new Date(),
            points: 20,
            type: QuestionType.QCM,
            choices: [],
        };

        const dialogRefMock: jasmine.SpyObj<MatDialogRef<QuestionFormComponent, Question>> = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefMock.afterClosed.and.returnValue(of(sampleQuestion));

        spyOn(dialog, 'open').and.returnValue(dialogRefMock);

        component.openEditDialog(sampleQuestion);

        expect(dialog.open).toHaveBeenCalledWith(QuestionFormComponent, { width: '800px', data: sampleQuestion, maxHeight: '90vh' });
        expect(questionServiceSpy.updateQuestion).toHaveBeenCalledWith(sampleQuestion);
    });

    it('should open edit dialog when creating a qcm', () => {
        const dialogRefMock: jasmine.SpyObj<MatDialogRef<QuestionFormComponent, Question | undefined>> = jasmine.createSpyObj('MatDialogRef', [
            'afterClosed',
        ]);
        dialogRefMock.afterClosed.and.returnValue(of(undefined));

        spyOn(dialog, 'open').and.returnValue(dialogRefMock);

        component.createQCMQuestion();

        expect(dialog.open).toHaveBeenCalledWith(QuestionFormComponent, { width: '800px', data: VOID_QCM_QUESTION, maxHeight: '90vh' });
        expect(questionServiceSpy.updateQuestion).not.toHaveBeenCalled();
    });

    it('should open edit dialog when creating a qrl', () => {
        const dialogRefMock: jasmine.SpyObj<MatDialogRef<QuestionFormComponent, Question | undefined>> = jasmine.createSpyObj('MatDialogRef', [
            'afterClosed',
        ]);
        dialogRefMock.afterClosed.and.returnValue(of(undefined));

        spyOn(dialog, 'open').and.returnValue(dialogRefMock);

        component.createQRLQuestion();

        expect(dialog.open).toHaveBeenCalledWith(QuestionFormComponent, { width: '800px', data: VOID_QRL_QUESTION, maxHeight: '90vh' });
        expect(questionServiceSpy.updateQuestion).not.toHaveBeenCalled();
    });

    it('should delete question on deleteQuestion method', () => {
        const questionId = '1';

        component.deleteQuestion(questionId);
        expect(questionServiceSpy.deleteQuestion).toHaveBeenCalledWith(questionId);
    });
});
