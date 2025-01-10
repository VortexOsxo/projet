import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { QuizService } from '@app/services/quiz-services/quiz.service';
import { Quiz } from '@common/interfaces/quiz';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { QuizDetailsComponent } from '@app/components/quiz-components/quiz-details/quiz-details.component';
import { QuizHeaderComponent } from '@app/components/quiz-components/quiz-header/quiz-header.component';
import { LogoTitleComponent } from '@app/components/logo-title/logo-title.component';
import { HttpClientModule } from '@angular/common/http';
import { Subject } from 'rxjs';
import { GameCreationService } from '@app/services/game-services/game-creation.service';
import { GameType } from '@common/enums/game-type';
import { Component } from '@angular/core';
import { RANDOM_QUIZ_ID } from '@common/config/game-config';
import { RANDOM_QUIZ } from '@app/consts/game.consts';
import { QuestionType } from '@common/enums/question-type';

const testQuizzes: Quiz[] = [
    {
        id: '1000',
        title: 'Pays',
        description: '',
        questions: [],
        duration: 45,
        lastModification: new Date(),
        isVisible: true,
    },
    {
        id: '1001',
        title: 'Langue',
        description: '',
        questions: [],
        duration: 45,
        lastModification: new Date(),
        isVisible: true,
    },
];

@Component({
    selector: 'app-question-filter',
    template: '',
})
export class MockQuestionFilterComponent {}

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;

    let matDialogSpy: jasmine.SpyObj<MatDialog>;

    let gameCreationServiceMock: jasmine.SpyObj<GameCreationService>;
    let mockQuizService: jasmine.SpyObj<QuizService>;

    const mockQuizEvent = new Subject<void>();
    const mockQuizEventInfoObservable = mockQuizEvent.asObservable();

    beforeEach(() => {
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        gameCreationServiceMock = jasmine.createSpyObj('GameCreationService', ['createGame', 'createGameTest']);

        mockQuizService = jasmine.createSpyObj('QuizService', ['getAllVisibleQuiz', 'addQuiz', 'removeQuiz', 'getQuizModificationObservable'], {
            quizEventInfoObservable: mockQuizEventInfoObservable,
        });
        (mockQuizService.getAllVisibleQuiz as jasmine.Spy).and.returnValue(testQuizzes);
        mockQuizService.addQuiz as jasmine.Spy;
        mockQuizService.removeQuiz as jasmine.Spy;

        mockQuizService.getQuizModificationObservable.and.returnValue(mockQuizEvent.asObservable());
        mockQuizService['quizModificationSubject'] = mockQuizEvent as Subject<void>;

        TestBed.configureTestingModule({
            declarations: [
                GameCreationPageComponent,
                LogoTitleComponent,
                MatSelectionList,
                QuizDetailsComponent,
                QuizHeaderComponent,
                MatListOption,
                MockQuestionFilterComponent,
            ],
            imports: [MatDialogModule, HttpClientModule],
            providers: [
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: GameCreationService, useValue: gameCreationServiceMock },
                { provide: QuizService, useValue: mockQuizService },
            ],
        });

        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create and call getAllVisibleQuiz to get its quiz', () => {
        expect(component).toBeTruthy();
        expect(mockQuizService.getAllVisibleQuiz).toHaveBeenCalled();
    });

    describe('Button should only be activated if we have a quiz selected', () => {
        it('Button should be deactivated if nothing is selected', () => {
            expect(component.areButtonDisabled()).toEqual(true);
        });

        it('Button should be activated if a quiz is selected', () => {
            component['selectedQuiz'] = testQuizzes[0];
            expect(component.areButtonDisabled()).toEqual(false);
        });
    });

    describe('isQuizSelected should properly indicate if a certain quiz is selected', () => {
        it('Should return false if no quiz is selected', () => {
            expect(component.isQuizSelected(testQuizzes[0])).toEqual(false);
        });

        it('Should return true if the argument is the selected quiz', () => {
            component['selectedQuiz'] = testQuizzes[0];
            expect(component.isQuizSelected(testQuizzes[0])).toEqual(true);
        });

        it('Should return false if the argument is not the selected quiz', () => {
            component['selectedQuiz'] = testQuizzes[0];
            expect(component.isQuizSelected(testQuizzes[1])).toEqual(false);
        });
    });

    it('Calling currentQuizzRemoved should reset the selected quiz and open a dialog', () => {
        component['selectedQuiz'] = testQuizzes[0];

        component.currentQuizRemoved();

        expect(component['selectedQuiz']).toBeNull();
    });

    describe('Should properly react to change in the quiz service', () => {
        const mockQuiz = {
            id: '123',
            title: 'titre',
            description: 'description',
            questions: [],
            lastModification: new Date(),
            duration: 30,
            isVisible: true,
        };

        it('should properly update the quizzes on event', () => {
            component['quizzes'] = [];

            mockQuizService['quizModificationSubject'].next();

            expect(component['quizzes']).toEqual(testQuizzes);
        });

        it('if the selected quiz is not still in the visible quizzes, should call currentQuizRemoved', () => {
            component['selectedQuiz'] = mockQuiz;
            const currentQuizRemovedSpy = spyOn(component, 'currentQuizRemoved');

            mockQuizService['quizModificationSubject'].next();

            expect(currentQuizRemovedSpy).toHaveBeenCalled();
        });

        it('if the selected quiz is still in the visible quizzes, should not call currentQuizRemoved', () => {
            component['selectedQuiz'] = testQuizzes[0];

            const currentQuizRemovedSpy = spyOn(component, 'currentQuizRemoved');
            mockQuizService['quizModificationSubject'].next();

            expect(currentQuizRemovedSpy).not.toHaveBeenCalled();
        });

        it('if the selected quiz is still in the visible quizzes, selected should have the same quiz', () => {
            component['selectedQuiz'] = testQuizzes[0];

            mockQuizService['quizModificationSubject'].next();

            expect(component['selectedQuiz']).toEqual(testQuizzes[0]);
            expect(component['isRandomQuizSelected']).toEqual(false);
        });
    });

    it('should set the selected value when an option is selected', () => {
        const mockOptionValue = testQuizzes[0];

        const matSelectionListChange: MatSelectionListChange = {
            options: [
                {
                    value: mockOptionValue,
                } as MatListOption,
            ],
            source: {} as MatSelectionList,
        };

        component.onSelectionChange(matSelectionListChange);
        expect(component['isRandomQuizSelected']).toEqual(false);

        expect(component['selectedQuiz']).toEqual(mockOptionValue);
    });

    it('should set the selectedQuiz and isRandomQuizSelected properly', () => {
        const matSelectionListChange: MatSelectionListChange = {
            options: [
                {
                    value: RANDOM_QUIZ,
                } as MatListOption,
            ],
            source: {} as MatSelectionList,
        };

        component.onSelectionChange(matSelectionListChange);

        expect(component['selectedQuiz']).toEqual(null);
        expect(component['isRandomQuizSelected']).toEqual(true);
    });

    it('should not change anything if the event is invalid', () => {
        component['selectedQuiz'] = null;
        component['isRandomQuizSelected'] = true;

        const matSelectionListChange: MatSelectionListChange = {
            options: [],
            source: {} as MatSelectionList,
        };

        component.onSelectionChange(matSelectionListChange);

        expect(component['selectedQuiz']).toEqual(null);
        expect(component['isRandomQuizSelected']).toEqual(true);
    });

    it('CreateGame should call createGame from GameCreationService', () => {
        component['selectedQuiz'] = testQuizzes[0];

        component.createGame(GameType.NormalGame);

        expect(gameCreationServiceMock.createGame).toHaveBeenCalledWith(testQuizzes[0].id, GameType.NormalGame);
    });

    it('CreateGame should not call createGame from GameCreationService', () => {
        component['selectedQuiz'] = null;

        component.createGame(GameType.TestGame);

        expect(gameCreationServiceMock.createGame).not.toHaveBeenCalled();
    });

    it('CreateGame should call createGame with hthe right id and type when creating random game', () => {
        component['selectedQuiz'] = null;
        component['isRandomQuizSelected'] = true;

        component.createGame(GameType.RandomGame);

        expect(gameCreationServiceMock.createGame).toHaveBeenCalledWith(RANDOM_QUIZ_ID, GameType.RandomGame);
    });

    it('should count the number of QCM questions', () => {
        const mockQuestions = [
            { type: QuestionType.QCM },
            { type: QuestionType.QRL },
            { type: QuestionType.QRL },
            { type: QuestionType.QCM },
            { type: QuestionType.QCM },
            { type: QuestionType.Undefined },
        ];

        const questionServiceMock = jasmine.createSpyObj('QuestionService', ['getQuestions']);
        questionServiceMock.getQuestions.and.returnValue(mockQuestions);

        component['questionService'] = questionServiceMock;
        const qcmCount = component['countQCMQuestions']();

        expect(qcmCount).toEqual(3);
    });
});
