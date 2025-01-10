import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { QuestionService } from './question.service';
import { QuestionCommunicationService } from './question-communication.service';
import { Question } from '@common/interfaces/question';
import { QuestionType } from '@common/enums/question-type';
import { VOID_QRL_QUESTION, VOID_QCM_QUESTION } from '@app/consts/question.consts';
import { EventEmitter } from '@angular/core';

describe('QuestionService', () => {
    let service: QuestionService;
    let questionCommunicationServiceSpy: jasmine.SpyObj<QuestionCommunicationService>;

    const testQuestion1: Question = {
        id: '0',
        text: 'Capitales',
        lastModification: new Date('2022-02-02'),
        points: 20,
        type: QuestionType.QCM,
        choices: [],
    };

    const testQuestion2: Question = {
        id: '1',
        text: 'Animaux',
        lastModification: new Date('2023-04-04'),
        points: 40,
        type: QuestionType.QCM,
        choices: [],
    };

    beforeEach(() => {
        questionCommunicationServiceSpy = jasmine.createSpyObj('QuestionCommunicationService', [
            'addQuestion',
            'deleteQuestion',
            'getQuestions',
            'updateQuestion',
        ]);
        questionCommunicationServiceSpy.getQuestions.and.returnValue(of([testQuestion1, testQuestion2]));
        questionCommunicationServiceSpy.questionsUpdatedEvent = new EventEmitter();

        TestBed.configureTestingModule({
            providers: [QuestionService, { provide: QuestionCommunicationService, useValue: questionCommunicationServiceSpy }],
        });
        service = TestBed.inject(QuestionService);
        questionCommunicationServiceSpy = TestBed.inject(QuestionCommunicationService) as jasmine.SpyObj<QuestionCommunicationService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('addQuestion', () => {
        it('should call addQuestion from the questionCommunicationService and reload questions', () => {
            const testQuestion: Question = {
                id: '1',
                text: 'Test Question',
                lastModification: new Date(),
                points: 10,
                type: QuestionType.QCM,
                choices: [],
            };
            questionCommunicationServiceSpy.addQuestion.and.returnValue(of(testQuestion2));
            service.addQuestion(testQuestion);
            expect(questionCommunicationServiceSpy.addQuestion).toHaveBeenCalledWith(testQuestion);
        });
    });

    describe('deleteQuestion', () => {
        it('should call deleteQuestion from the questionCommunicationService and reload questions', () => {
            const questionId = '1';
            questionCommunicationServiceSpy.deleteQuestion.and.returnValue(of(testQuestion1));
            service.deleteQuestion(questionId);
            expect(questionCommunicationServiceSpy.deleteQuestion).toHaveBeenCalledWith(questionId);
        });
    });

    describe('getQuestions', () => {
        it('should return questions', () => {
            const testQuestions: Question[] = [testQuestion2];
            service['questionsSubject'].next(testQuestions);
            expect(service.getQuestions()).toEqual(testQuestions);
        });
    });

    describe('createVoidQuestion', () => {
        it('should return a void question', () => {
            expect(service.createVoidQCMQuestion()).toEqual(VOID_QCM_QUESTION);
        });
    });

    describe('createVoidQRLQuestion', () => {
        it('should return a void QRL question', () => {
            expect(service.createVoidQRLQuestion()).toEqual(VOID_QRL_QUESTION);
        });
    });

    describe('updateQuestion', () => {
        it('should update a question and call updateQuestion from the questionCommunicationService', () => {
            const testQuestions: Question[] = [
                { id: '1', text: 'Test Question', lastModification: new Date(), points: 10, type: QuestionType.QCM, choices: [] },
            ];
            const updatedQuestion: Question = { ...testQuestions[0], text: 'Updated Test Question' };

            questionCommunicationServiceSpy.updateQuestion.and.returnValue(of(testQuestion1));
            service['questionsSubject'].next(testQuestions);

            service.updateQuestion(updatedQuestion);
            expect(questionCommunicationServiceSpy.updateQuestion).toHaveBeenCalledWith(updatedQuestion);
        });
    });

    describe('addFilterByQuestionType', () => {
        it('should add filter by question type and reload questions', () => {
            const testQuestions: Question[] = [
                { id: '1', text: 'Test Question 1', lastModification: new Date(), points: 10, type: QuestionType.QCM, choices: [] },
                { id: '2', text: 'Test Question 2', lastModification: new Date(), points: 10, type: QuestionType.QRL, choices: [] },
                { id: '3', text: 'Test Question 3', lastModification: new Date(), points: 10, type: QuestionType.QCM, choices: [] },
            ];
            service['questionsSubject'].next(testQuestions);
            service.addFilterByQuestionType(QuestionType.QCM);
            expect(service.getQuestions().length).toBe(2);
        });
    });

    describe('removeFilter', () => {
        it('should remove filter and reload questions', () => {
            const testQuestions: Question[] = [
                { id: '1', text: 'Test Question 1', lastModification: new Date(), points: 10, type: QuestionType.QCM, choices: [] },
                { id: '2', text: 'Test Question 2', lastModification: new Date(), points: 10, type: QuestionType.QRL, choices: [] },
                { id: '3', text: 'Test Question 3', lastModification: new Date(), points: 10, type: QuestionType.QCM, choices: [] },
            ];

            questionCommunicationServiceSpy.getQuestions.and.returnValue(of(testQuestions));

            service['questionsSubject'].next(testQuestions);
            service.removeFilter();
            expect(service.getQuestions().length).toBe(3);
        });
    });

    describe('doesQuestionTextExist', () => {
        it('should return true if question text exists', () => {
            const testQuestions: Question[] = [
                { id: '1', text: 'Test Question', lastModification: new Date(), points: 10, type: QuestionType.QCM, choices: [] },
            ];
            service['unfilteredQuestions'] = testQuestions;
            expect(service.doesQuestionTextExist('Test Question')).toBeTrue();
        });

        it('should return false if question text does not exist', () => {
            const testQuestions: Question[] = [
                { id: '1', text: 'Test Question', lastModification: new Date(), points: 10, type: QuestionType.QCM, choices: [] },
            ];
            service['questionsSubject'].next(testQuestions);
            expect(service.doesQuestionTextExist('Non-existing Question')).toBeFalse();
        });
    });

    it('should set questions to the filtered and sorted list of questions if no updatedQuestions are provided', () => {
        const testQuestions: Question[] = [
            { id: '1', text: 'Test Question 1', lastModification: new Date(), points: 10, type: QuestionType.QCM, choices: [] },
            { id: '2', text: 'Test Question 2', lastModification: new Date(), points: 10, type: QuestionType.QRL, choices: [] },
            { id: '3', text: 'Test Question 3', lastModification: new Date(), points: 10, type: QuestionType.QCM, choices: [] },
        ];
        service['questionsSubject'].next(testQuestions);

        const nextSpy = spyOn(service['questionsSubject'], 'next');
        service['setQuestions']();

        expect(nextSpy).toHaveBeenCalledWith(testQuestions);
    });

    it('should call load question when event emiter of question communication service emit', () => {
        const loadQuestionSpy = spyOn(service as unknown as { loadQuestions: () => Question[] }, 'loadQuestions');

        questionCommunicationServiceSpy.questionsUpdatedEvent.emit();

        expect(loadQuestionSpy).toHaveBeenCalled();
    });
});
