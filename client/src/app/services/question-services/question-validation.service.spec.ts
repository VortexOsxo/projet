import { TestBed } from '@angular/core/testing';
import { Question } from '@common/interfaces/question';
import { Choice } from '@common/interfaces/choice';
import { QuestionValidationService } from './question-validation.service';
import { QuestionType } from '@common/enums/question-type';
import { MatDialog } from '@angular/material/dialog';
import { QuestionService } from './question.service';
import { InformationModalComponent } from '@app/components/modal/information-modal/information-modal.component';
import { QuestionValidationError } from '@app/enums/question-validation-error';

describe('QuestionValidationService', () => {
    let service: QuestionValidationService;
    let questionServiceMock: jasmine.SpyObj<QuestionService>;
    let dialogMock: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        questionServiceMock = jasmine.createSpyObj('QuestionService', ['addQuestion', 'doesQuestionTextExist', 'updateQuestion']);
        TestBed.configureTestingModule({
            providers: [
                { provide: QuestionService, useValue: questionServiceMock },
                { provide: MatDialog, useValue: dialogMock },
            ],
        });
        service = TestBed.inject(QuestionValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('validateQuestionPoints', () => {
        it('should return valid response for points within range', () => {
            const mockPointValue = 50;
            const validResponse = service.validateQuestionPoints(mockPointValue);
            expect(validResponse.isValid).toBe(true);
        });

        it('should return invalid response for points less than 10', () => {
            const mockPointValue = 5;
            const invalidResponse = service.validateQuestionPoints(mockPointValue);
            expect(invalidResponse.isValid).toBe(false);
            expect(invalidResponse.errorMessage).toBe("Les points pour une bonne réponse doivent être dans l'intervalle [10 à 100]");
        });

        it('should return invalid response for points greater than 100', () => {
            const mockPointValue = 150;
            const invalidResponse = service.validateQuestionPoints(mockPointValue);
            expect(invalidResponse.isValid).toBe(false);
            expect(invalidResponse.errorMessage).toBe("Les points pour une bonne réponse doivent être dans l'intervalle [10 à 100]");
        });

        it('should return invalid response for points not multiple of 10', () => {
            const mockPointValue = 15;
            const invalidResponse = service.validateQuestionPoints(mockPointValue);
            expect(invalidResponse.isValid).toBe(false);
            expect(invalidResponse.errorMessage).toBe('Les points pour une bonne réponse doivent être un multiple de 10');
        });
    });

    describe('validateName', () => {
        it('should return valid response for valid name', () => {
            const validResponse = service.validateName('Question 1');
            expect(validResponse.isValid).toBe(true);
        });

        it('should return invalid response for empty name', () => {
            const invalidResponse = service.validateName('');
            expect(invalidResponse.isValid).toBe(false);
            expect(invalidResponse.errorMessage).toBe('Ce champ ne peut pas être vide');
        });
    });

    describe('validateChoiceText', () => {
        it('should return valid response for valid choice text', () => {
            const validResponse = service.validateChoiceText('Choice A');
            expect(validResponse.isValid).toBe(true);
        });

        it('should return invalid response for empty choice text', () => {
            const invalidResponse = service.validateChoiceText('');
            expect(invalidResponse.isValid).toBe(false);
            expect(invalidResponse.errorMessage).toBe('Le texte du choix ne peut pas être vide');
        });
    });

    describe('validateResponses', () => {
        it('should return valid response for valid responses', () => {
            const choices = [
                { text: 'Choice A', isCorrect: true },
                { text: 'Choice B', isCorrect: false },
            ];
            const validResponse = service.validateResponses(choices);
            expect(validResponse.isValid).toBe(true);
        });

        it('should return invalid response for empty responses', () => {
            const choices: Choice[] = [];
            const invalidResponse = service.validateResponses(choices);
            expect(invalidResponse.isValid).toBe(false);
            expect(invalidResponse.errorMessage).toBe('Il doit y avoir au moins une réponse correcte et une réponse incorrecte');
        });

        it('should return invalid response for only correct responses', () => {
            const choices = [
                { text: 'Choice A', isCorrect: true },
                { text: 'Choice B', isCorrect: true },
            ];
            const invalidResponse = service.validateResponses(choices);
            expect(invalidResponse.isValid).toBe(false);
            expect(invalidResponse.errorMessage).toBe('Il doit y avoir au moins une réponse correcte et une réponse incorrecte');
        });

        it('should return invalid response for only incorrect responses', () => {
            const choices = [
                { text: 'Choice A', isCorrect: false },
                { text: 'Choice B', isCorrect: false },
            ];
            const invalidResponse = service.validateResponses(choices);
            expect(invalidResponse.isValid).toBe(false);
            expect(invalidResponse.errorMessage).toBe('Il doit y avoir au moins une réponse correcte et une réponse incorrecte');
        });
    });

    describe('validateQuestion', () => {
        it('should return true for valid question', () => {
            const testQuestion1: Question = {
                text: 'Sample Question',
                points: 20,
                type: QuestionType.QCM,
                choices: [
                    { text: 'Choice A', isCorrect: true },
                    { text: 'Choice B', isCorrect: false },
                ],
                id: '',
                lastModification: new Date(),
            };
            const isValid = service.validateQuestion(testQuestion1);
            expect(isValid).toBe(true);
        });

        it('should return false for question with invalid name', () => {
            const testQuestion2: Question = {
                text: '',
                points: 20,
                type: QuestionType.QCM,
                choices: [
                    { text: 'Choice A', isCorrect: true },
                    { text: 'Choice B', isCorrect: false },
                ],
                id: '',
                lastModification: new Date(),
            };
            const isValid = service.validateQuestion(testQuestion2);
            expect(isValid).toBe(false);
        });

        it('should return false for question with invalid points', () => {
            const testQuestion3: Question = {
                text: 'Sample Question',
                points: 5,
                type: QuestionType.QCM,
                choices: [
                    { text: 'Choice A', isCorrect: true },
                    { text: 'Choice B', isCorrect: false },
                ],
                id: '',
                lastModification: new Date(),
            };
            const isValid = service.validateQuestion(testQuestion3);
            expect(isValid).toBe(false);
        });

        it('should return false for question with invalid responses', () => {
            const testQuestion: Question = {
                text: 'Sample Question',
                points: 20,
                type: QuestionType.QCM,
                choices: [],
                id: '',
                lastModification: new Date(),
            };
            const isValid = service.validateQuestion(testQuestion);
            expect(isValid).toBe(false);
        });
    });
    describe('attemptQuestionSubmit()', () => {
        it('should open text modal when question text exists', () => {
            questionServiceMock.doesQuestionTextExist.and.returnValue(true);
            service.attemptQuestionSubmit({ id: '0', text: 'Sample Text' } as Question);
            expect(dialogMock.open).toHaveBeenCalledWith(InformationModalComponent, {
                data: QuestionValidationError.DuplicateQuestionTitle,
            });
        });

        it('should open text modal when question is invalid', () => {
            questionServiceMock.doesQuestionTextExist.and.returnValue(true);
            service.attemptQuestionSubmit({
                id: '0',
                text: 'Sample Text',
                type: QuestionType.QCM,
                points: 0,
                choices: [{ text: 'Q1', isCorrect: false }],
            } as Question);
            expect(dialogMock.open).toHaveBeenCalledWith(InformationModalComponent, {
                data: QuestionValidationError.ErrorsRemaining,
            });
        });

        it('should add question if question text does not exist', () => {
            const newQuestion = { id: '0', text: 'New Question Text' } as Question;
            questionServiceMock.doesQuestionTextExist.and.returnValue(false);
            service.attemptQuestionSubmit(newQuestion);

            expect(questionServiceMock.addQuestion).toHaveBeenCalledWith(newQuestion);
        });

        describe('attemptQuestionSubmit()', () => {
            it('should call updateQuestion() when question id is not 0', () => {
                service.attemptQuestionSubmit({ id: '1', text: 'Sample Text' } as Question);
                expect(questionServiceMock.updateQuestion).toHaveBeenCalledWith({ id: '1', text: 'Sample Text' } as Question);
            });
        });
    });
});
