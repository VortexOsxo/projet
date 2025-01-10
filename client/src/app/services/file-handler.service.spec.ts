import { TestBed } from '@angular/core/testing';
import { Quiz } from '@common/interfaces/quiz';
import { FileHandlerService } from './file-handler.service';
import { QuizValidationService } from '@app/services/quiz-services/quiz-validation.service';

describe('FileHandlerService', () => {
    let service: FileHandlerService;
    let quizValidationServiceSpy: jasmine.SpyObj<QuizValidationService>;
    let mockQuiz: Quiz;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('QuizValidationService', ['validateQuizName']);
        mockQuiz = {
            id: '0',
            title: 'Invalid Quiz',
            description: 'Description',
            questions: [],
            duration: 60,
            lastModification: new Date(),
            isVisible: true,
        };
        TestBed.configureTestingModule({
            providers: [FileHandlerService, { provide: QuizValidationService, useValue: spy }],
        });
        service = TestBed.inject(FileHandlerService);
        quizValidationServiceSpy = TestBed.inject(QuizValidationService) as jasmine.SpyObj<QuizValidationService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('checkFile', () => {
        it('should return valid if file is provided', () => {
            const file = new File([''], 'test.json', { type: 'application/json' });
            const result = service.checkFile(file);
            expect(result.isValid).toBe(true);
            expect(result.errorMessage).toBe('');
        });

        it('should return invalid if no file is provided', () => {
            const result = service.checkFile(null);
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBe('Veuillez choisir un fichier.');
        });

        it('should return invalid if file type is not JSON', () => {
            const file = new File([''], 'test.txt', { type: 'text/plain' });
            const result = service.checkFile(file);
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBe('Fichier invalide. Veuillez choisir un fichier JSON.');
        });
    });

    describe('transformFile', () => {
        it('should transform file into Quiz object', async () => {
            const file = new File(
                [
                    JSON.stringify({
                        title: 'Quiz Title',
                        description: 'Quiz Description',
                        questions: [],
                        duration: 60,
                    }),
                ],
                'quiz.json',
                { type: 'application/json' },
            );

            const quiz = await service.transformFile(file);
            expect(quiz).toBeDefined();
        });
    });

    describe('checkQuizName', () => {
        it('should return valid if quiz name is unique', () => {
            quizValidationServiceSpy.validateQuizName.and.returnValue({ errorMessage: '', isValid: true });
            service.checkQuizName(mockQuiz);
            expect(quizValidationServiceSpy.validateQuizName).toHaveBeenCalledWith(mockQuiz.title, mockQuiz.id);
        });

        it('should return invalid if quiz name is not unique', () => {
            quizValidationServiceSpy.validateQuizName.and.returnValue({ errorMessage: 'Duplicate name', isValid: false });
            service.checkQuizName(mockQuiz);
            expect(quizValidationServiceSpy.validateQuizName).toHaveBeenCalledWith(mockQuiz.title, mockQuiz.id);
        });
    });
});
