import { TestBed } from '@angular/core/testing';
import { Question } from '@common/interfaces/question';
import { Quiz } from '@common/interfaces/quiz';
import { QuestionValidationService } from '@app/services/question-services/question-validation.service';
import { QuizValidationService } from './quiz-validation.service';
import { QuestionType } from '@common/enums/question-type';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { QuizService } from './quiz.service';

const testQuestions: Question[] = [
    {
        id: '0',
        text: '1',
        type: QuestionType.QCM,
        points: 10,
        choices: [
            {
                text: '1',
                isCorrect: true,
            },
            {
                text: '1',
                isCorrect: false,
            },
        ],
        lastModification: new Date(),
    },
    {
        id: '1',
        text: '2',
        type: QuestionType.QCM,
        points: 10,
        choices: [
            {
                text: '1',
                isCorrect: true,
            },
            {
                text: '1',
                isCorrect: false,
            },
        ],
        lastModification: new Date(),
    },
];

const mockExistingQuizzes = [
    {
        id: '3',
        title: 'QuizName1',
        description: 'Test Description',
        questions: testQuestions,
        duration: 30,
        lastModification: new Date(),
        isVisible: true,
    },
    {
        id: '2',
        title: 'QuizName2',
        description: 'Test Description',
        questions: testQuestions,
        duration: 30,
        lastModification: new Date(),
        isVisible: false,
    },
];

const validQuiz: Quiz = {
    id: '1',
    title: 'Test Quiz',
    description: 'Test Description',
    questions: testQuestions,
    duration: 30,
    lastModification: new Date(),
    isVisible: true,
};

describe('QuizValidationService', () => {
    let quizValidationService: QuizValidationService;
    let questionValidationServiceSpy: jasmine.SpyObj<QuestionValidationService>;
    let quizServiceSpy: jasmine.SpyObj<QuizService>;

    beforeEach(() => {
        questionValidationServiceSpy = jasmine.createSpyObj('QuestionValidationService', ['validateQuestion']);
        questionValidationServiceSpy.validateQuestion.and.returnValue(false);

        quizServiceSpy = jasmine.createSpyObj('QuizService', ['getAllQuiz', 'addQuiz']);
        quizServiceSpy.getAllQuiz.and.returnValue(mockExistingQuizzes);

        TestBed.configureTestingModule({
            imports: [MatDialogModule, MatIconModule],
            providers: [
                QuizValidationService,
                { provide: QuestionValidationService, useValue: questionValidationServiceSpy },
                { provide: QuizService, useValue: quizServiceSpy },
            ],
        });
        quizValidationService = TestBed.inject(QuizValidationService);
        quizValidationService['quizToModify'] = null;
    });

    it('should be created', () => {
        expect(quizValidationService).toBeTruthy();
    });

    describe('setting the quiz to modify', () => {
        it('should properly set the quiz to modify', () => {
            quizValidationService.setQuizToModify(validQuiz);

            expect(quizValidationService['quizToModify']).toEqual(validQuiz);
        });

        it('should properly get the quiz to modify', () => {
            quizValidationService['quizToModify'] = validQuiz;

            expect(quizValidationService.getQuizToModify()).toEqual(validQuiz);
        });

        it('Should return null if not set', () => {
            expect(quizValidationService.getQuizToModify()).toEqual(null);
        });
    });

    describe('validateAnswerTime', () => {
        it('should return valid response for valid answer time', () => {
            const validTime = 30;
            const validResponse = quizValidationService.validateAnswerTime(validTime);
            expect(validResponse.isValid).toBe(true);
        });

        it('should return invalid response for invalid answer time', () => {
            const invalidTime = 61;
            const invalidResponse = quizValidationService.validateAnswerTime(invalidTime);
            expect(invalidResponse.isValid).toBe(false);
            expect(invalidResponse.errorMessage).toBe('La durée de réponse doit être entre 10 et 60 secondes inclusivement');
        });
    });

    describe('validateQuizName', () => {
        const newQuizId = '0';
        it('should return valid response for valid name', () => {
            const validResponse = quizValidationService.validateQuizName('Valid Name', newQuizId);
            expect(validResponse.isValid).toBe(true);
        });

        it('should return invalid response for empty name', () => {
            const invalidResponse = quizValidationService.validateQuizName('', newQuizId);
            expect(invalidResponse.isValid).toBe(false);
            expect(invalidResponse.errorMessage).toBe('Le nom du quiz ne peut pas être vide');
        });

        it('should return invalid for an existing quiz name', () => {
            const existingName = mockExistingQuizzes[0].title;

            const result = quizValidationService.validateQuizName(existingName, newQuizId);
            expect(result.isValid).toEqual(false);
        });

        it('blank space and capsulation should not be counted as a difference in for the quiz name', () => {
            const existingName = '   ' + mockExistingQuizzes[0].title + '   '.toUpperCase();

            const result = quizValidationService.validateQuizName(existingName, newQuizId);
            expect(result.isValid).toEqual(false);
        });

        it('if the same name is actually the name of the quiz we are modifying should return valid', () => {
            const existingName = mockExistingQuizzes[0].title;
            const existingId = mockExistingQuizzes[0].id;
            const result = quizValidationService.validateQuizName(existingName, existingId);
            expect(result.isValid).toEqual(true);
        });
    });

    describe('validateQuizDescription', () => {
        it('should return valid response for valid description', () => {
            const validResponse = quizValidationService.validateQuizDescription('Valid Description');
            expect(validResponse.isValid).toBe(true);
        });

        it('should return invalid response for empty description', () => {
            const invalidResponse = quizValidationService.validateQuizDescription('');
            expect(invalidResponse.isValid).toBe(false);
            expect(invalidResponse.errorMessage).toBe('La description du quiz ne peut pas être vide');
        });
    });

    describe('validateQuiz', () => {
        it('should return true for valid quiz', () => {
            questionValidationServiceSpy.validateQuestion.and.returnValue(true);
            const isValid = quizValidationService.validateQuiz(validQuiz).isValid;
            expect(isValid).toBe(true);
        });

        it('should return false for quiz with no questions', () => {
            const invalidQuiz: Quiz = {
                id: '1',
                title: 'Test Quiz',
                description: 'Test Description',
                questions: [],
                duration: 30,
                lastModification: new Date(),
                isVisible: true,
            };
            const isValid = quizValidationService.validateQuiz(invalidQuiz).isValid;
            expect(isValid).toBe(false);
        });

        it('should return false for a quiz with no title', () => {
            const invalidQuiz: Quiz = {
                id: '1',
                title: '',
                description: 'Test Description',
                questions: [testQuestions[0]],
                duration: 30,
                lastModification: new Date(),
                isVisible: true,
            };
            const isValid = quizValidationService.validateQuiz(invalidQuiz).isValid;
            expect(isValid).toBe(false);
        });

        it('should return false for a quiz with no description', () => {
            const invalidQuiz: Quiz = {
                id: '1',
                title: 'Title',
                description: '',
                questions: [testQuestions[0]],
                duration: 30,
                lastModification: new Date(),
                isVisible: true,
            };
            const isValid = quizValidationService.validateQuiz(invalidQuiz).isValid;
            expect(isValid).toBe(false);
        });

        it('should return false for a quiz an invalid duration', () => {
            const invalidQuiz: Quiz = {
                id: '1',
                title: 'Title',
                description: 'Description',
                questions: [testQuestions[0]],
                duration: 135,
                lastModification: new Date(),
                isVisible: true,
            };
            const isValid = quizValidationService.validateQuiz(invalidQuiz).isValid;
            expect(isValid).toBe(false);
        });

        it('should use question validaton service to validate question and repond accordingly', () => {
            const isValid = quizValidationService.validateQuiz(validQuiz).isValid;
            expect(isValid).toBe(false);
            expect(questionValidationServiceSpy.validateQuestion).toHaveBeenCalled();
        });

        it('attemptSubmit if the quiz is valid, should call addquiz from the quiz communication service', () => {
            questionValidationServiceSpy.validateQuestion.and.returnValue(true);
            const result = quizValidationService.attemptSubmit(validQuiz);

            expect(result.isValid).toBe(true);
            expect(quizServiceSpy.addQuiz).toHaveBeenCalledWith(validQuiz);
        });

        it('attemptSubmit if the quiz is not valid, should not call addquiz from the quiz communication service', () => {
            const invalidQuiz: Quiz = {
                id: '1',
                title: '',
                description: 'Description',
                questions: [],
                duration: 135,
                lastModification: new Date(),
                isVisible: true,
            };
            const result = quizValidationService.attemptSubmit(invalidQuiz);

            expect(result.isValid).toBe(false);
            expect(quizServiceSpy.addQuiz).not.toHaveBeenCalled();
        });
    });
});
