import { TestBed } from '@angular/core/testing';
import { QuestionValidationService } from '@app/services/question-services/question-validation.service';
import { QuestionService } from '@app/services/question-services/question.service';
import { InputValidity } from '@app/interfaces/input-validity';
import { QuestionModificationBase } from './question-modification-base';
import { Question } from '@common/interfaces/question';
import { Directive } from '@angular/core';

@Directive()
export class TestQuestionModification extends QuestionModificationBase {
    question: Question;

    constructor(
        protected questionValidationService: QuestionValidationService,
        protected questionService: QuestionService,
    ) {
        super(questionValidationService, questionService);
    }
}

describe('TestQuestionModification', () => {
    let testQuestionModification: TestQuestionModification;
    let questionValidationServiceSpy: jasmine.SpyObj<QuestionValidationService>;
    let questionServiceSpy: jasmine.SpyObj<QuestionService>;

    beforeEach(() => {
        const questionValidationServiceSpyObj = jasmine.createSpyObj('QuestionValidationService', [
            'validateQuestionPoints',
            'validateName',
            'attemptQuestionSubmit',
        ]);
        const questionServiceSpyObj = jasmine.createSpyObj('QuestionService', ['addQuestion']);

        TestBed.configureTestingModule({
            providers: [
                { provide: QuestionValidationService, useValue: questionValidationServiceSpyObj },
                { provide: QuestionService, useValue: questionServiceSpyObj },
            ],
        });
        questionValidationServiceSpy = TestBed.inject(QuestionValidationService) as jasmine.SpyObj<QuestionValidationService>;
        questionServiceSpy = TestBed.inject(QuestionService) as jasmine.SpyObj<QuestionService>;

        testQuestionModification = new TestQuestionModification(questionValidationServiceSpy, questionServiceSpy);
    });

    it('should create', () => {
        expect(testQuestionModification).toBeTruthy();
    });

    it('should call validateQuestionPoints with correct points', () => {
        const mockPoints = 10;
        testQuestionModification.question = { id: '1', text: 'Test question', points: mockPoints, lastModification: new Date() } as Question;
        questionValidationServiceSpy.validateQuestionPoints.and.returnValue({ isValid: true, errorMessage: '' } as InputValidity);

        const validity = testQuestionModification.questionPointsValidity;

        expect(questionValidationServiceSpy.validateQuestionPoints).toHaveBeenCalledWith(mockPoints);
        expect(validity.isValid).toBe(true);
        expect(validity.errorMessage).toBe('');
    });

    it('should call validateName with correct text', () => {
        testQuestionModification.question = { id: '1', text: 'Test question', points: 10, lastModification: new Date() } as Question;
        questionValidationServiceSpy.validateName.and.returnValue({ isValid: true, errorMessage: '' } as InputValidity);

        const validity = testQuestionModification.nameValidity;

        expect(questionValidationServiceSpy.validateName).toHaveBeenCalledWith('Test question');
        expect(validity.isValid).toBe(true);
        expect(validity.errorMessage).toBe('');
    });

    it('should update lastModification and call attemptQuestionSubmit', () => {
        testQuestionModification.question = { id: '1', text: 'Test question', points: 10 } as Question;
        questionValidationServiceSpy.attemptQuestionSubmit.and.stub();

        testQuestionModification.addToQuestionBank();

        expect(testQuestionModification.question.lastModification).toBeTruthy();
        expect(questionValidationServiceSpy.attemptQuestionSubmit).toHaveBeenCalledWith(testQuestionModification.question);
    });
});
