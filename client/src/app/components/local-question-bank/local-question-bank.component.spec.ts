import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { LocalQuestionBankComponent } from './local-question-bank.component';
import { QuestionService } from '@app/services/question-services/question.service';
import { QuestionCommunicationService } from '@app/services/question-services/question-communication.service';
import { Question } from '@common/interfaces/question';
import { QuestionType } from '@common/enums/question-type';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';

@Component({
    selector: 'app-question-filter',
    template: '',
})
export class MockQuestionFilterComponent {}

describe('LocalQuestionBankComponent', () => {
    let component: LocalQuestionBankComponent;
    let questionService: QuestionService;
    let fixture: ComponentFixture<LocalQuestionBankComponent>;

    let testQuestions: Question[];

    beforeEach(() => {
        testQuestions = [
            { id: '1', text: 'Question 1', lastModification: new Date(), points: 10, type: QuestionType.QCM, choices: [] },
            { id: '2', text: 'Question 2', lastModification: new Date(), points: 15, type: QuestionType.QCM, choices: [] },
        ];

        TestBed.configureTestingModule({
            declarations: [LocalQuestionBankComponent, MockQuestionFilterComponent],
            imports: [HttpClientTestingModule, MatDialogModule, MatListModule, FormsModule, MatCardModule, MatButtonModule],
            providers: [QuestionService, QuestionCommunicationService],
        });

        fixture = TestBed.createComponent(LocalQuestionBankComponent);
        questionService = TestBed.inject(QuestionService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should properly subscribe to the questions on ngOnInit', () => {
        component.questions = [];
        component.ngOnInit();
        questionService['questionsSubject'].next(testQuestions);

        expect(component.questions).toEqual(testQuestions);
    });

    it('should properly emit newItemEvent with updated list', () => {
        const testSelectedQuestions: Question[] = [testQuestions[0], testQuestions[1]];
        component.selectedQuestions = testSelectedQuestions;

        let emittedQuestions: Question[] | undefined;
        component.newItemEvent.subscribe((updatedQuestions: Question[]) => {
            emittedQuestions = updatedQuestions;
        });

        const expectedAsnwer = testSelectedQuestions.map((question) => ({
            ...question,
            alreadyInBank: false,
        }));

        component.addQuestionsToQuiz();
        expect(emittedQuestions).toEqual(expectedAsnwer);
    });
});
