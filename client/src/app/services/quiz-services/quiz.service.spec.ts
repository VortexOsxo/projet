import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Quiz } from '@common/interfaces/quiz';
import { Observable, Subject, of } from 'rxjs';
import { QuizCommunicationService } from './quiz-communication.service';
import { QuizService } from './quiz.service';
import { EventEmitter } from '@angular/core';

let testQuiz: Quiz;
let testQuiz2: Quiz;

class MockQuizCommunicationService {
    quizModifiedEvent: EventEmitter<void> = new EventEmitter<void>();

    getQuizzes(): Observable<Quiz[]> {
        return of([testQuiz]);
    }

    addQuiz(quiz: Quiz): Observable<HttpResponse<string>> {
        const mockResponse = new HttpResponse({ body: quiz !== undefined ? 'Succes' : 'Error', status: 200, statusText: 'OK' });
        return of(mockResponse);
    }

    removeQuiz(quizId: string): Observable<HttpResponse<string>> {
        const mockResponse = new HttpResponse({ body: quizId !== undefined ? 'Succes' : 'Error', status: 200, statusText: 'OK' });
        return of(mockResponse);
    }

    updateQuiz(quiz: Quiz): Observable<HttpResponse<string>> {
        const mockResponse = new HttpResponse({ body: quiz !== undefined ? 'Succes' : 'Error', status: 200, statusText: 'OK' });
        return of(mockResponse);
    }
}

describe('QuizService', () => {
    let service: QuizService;

    beforeEach(() => {
        testQuiz = {
            id: '1',
            title: 'Capitale du monde',
            description: 'Pouvez-vous deviner toutes ces capitales ?',
            questions: [],
            duration: 30,
            lastModification: new Date(),
            isVisible: true,
        };
        testQuiz2 = {
            id: '34',
            title: 'Capitale du monde',
            description: 'Pouvez-vous deviner toutes ces capitales ?',
            questions: [],
            duration: 45,
            lastModification: new Date(),
            isVisible: false,
        };
        TestBed.configureTestingModule({
            imports: [],
            providers: [{ provide: QuizCommunicationService, useClass: MockQuizCommunicationService }],
        });
        service = TestBed.inject(QuizService);
        service['quizzes'] = [];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Accessing data tests', () => {
        it('getAllQuiz should return all the quizzes', () => {
            const expectedArray: Quiz[] = [testQuiz, testQuiz2];
            service['quizzes'] = [testQuiz, testQuiz2];

            expect(service.getAllQuiz()).toEqual(expectedArray);
        });

        it('getAllVisibleQuizz should only return the visible quizzes', () => {
            const expectedArray: Quiz[] = [testQuiz];
            service['quizzes'] = [testQuiz, testQuiz2];

            expect(service.getAllVisibleQuiz()).toEqual(expectedArray);
        });
    });

    describe('Quiz manipulation tests', () => {
        it('add quiz should call add quiz from the communication service', () => {
            const addQuizSpy = spyOn(service['quizCommunicationService'], 'addQuiz').and.returnValue(
                of(new HttpResponse({ body: 'Success', status: 200 })),
            );
            service.addQuiz(testQuiz);

            expect(addQuizSpy).toHaveBeenCalled();
        });

        it('toggling the visibility of a quiz should change the isVisible property of the quiz', () => {
            const expectedVisibility = false;
            service['quizzes'] = [testQuiz];

            service.toggleVisibility(testQuiz.id);

            expect(service['quizzes'][0].isVisible).toEqual(expectedVisibility);
        });

        it('toggling the visibility of a quiz should also ask the communication service to update the quiz', () => {
            const updateQuizSpy = spyOn(service['quizCommunicationService'], 'updateQuiz').and.returnValue(
                of(new HttpResponse({ body: 'Success', status: 200 })),
            );
            service['quizzes'] = [testQuiz, testQuiz2];
            service.toggleVisibility(testQuiz.id);

            const expectedArguement = { ...testQuiz, isVisible: false };

            expect(updateQuizSpy).toHaveBeenCalledWith(expectedArguement);
        });

        it('trying to update a quiz not in the array should do nothing', () => {
            const updateQuizSpy = spyOn(service['quizCommunicationService'], 'updateQuiz').and.returnValue(
                of(new HttpResponse({ body: 'Success', status: 200 })),
            );

            const fakeQuiz: Quiz = {
                id: 'allo',
                title: 'fake quiz',
                description: 'fake quiz',
                questions: [],
                duration: 30,
                lastModification: new Date(),
                isVisible: true,
            };

            service.toggleVisibility(fakeQuiz.id);

            expect(updateQuizSpy).not.toHaveBeenCalled();
        });

        it('deleting a quiz should call the remove quiz from communication service if the quiz is found', () => {
            const removeQuizSpy = spyOn(service['quizCommunicationService'], 'removeQuiz').and.returnValue(
                of(new HttpResponse({ body: 'Success', status: 200 })),
            );
            service['quizzes'] = [testQuiz];

            service.removeQuiz(testQuiz.id);

            expect(removeQuizSpy).toHaveBeenCalledWith(testQuiz.id);
        });

        it('deleting a quiz which isnt in the array shouldnt do anything', () => {
            const removeQuizSpy = spyOn(service['quizCommunicationService'], 'removeQuiz').and.returnValue(
                of(new HttpResponse({ body: 'Success', status: 200 })),
            );
            service['quizzes'] = [];

            service.removeQuiz(testQuiz.id);

            expect(removeQuizSpy).not.toHaveBeenCalled();
        });
    });

    describe('Find quiz method', () => {
        it('should return the quiz if it exist', () => {
            service['quizzes'] = [testQuiz, testQuiz2];
            expect(service['findQuizById'](testQuiz2.id)).toEqual(testQuiz2);
        });

        it('should return undefined if the quiz isnt found', () => {
            service['quizzes'] = [testQuiz];
            expect(service['findQuizById'](testQuiz2.id)).toBeUndefined();
        });
    });

    it('should return proper observable for quizModification event', () => {
        const quizModificationSubject = new Subject<void>();
        service['quizModificationSubject'] = quizModificationSubject;

        const observable = service.getQuizModificationObservable();

        let serviceEmitted = false;

        observable.subscribe(() => {
            serviceEmitted = true;
        });

        quizModificationSubject.next();

        expect(serviceEmitted).toBe(true);
    });

    describe('Subscription to eventEmitter tests', () => {
        it('the quiz should be updated when the eventEmitter from the communicationService Emit', () => {
            service['quizzes'] = [];

            service['quizCommunicationService'].quizModifiedEvent.emit();

            expect(service['quizzes']).toEqual([testQuiz]);
        });
    });

    describe('Subscription to eventEmitter tests', () => {
        it('the quiz should be updated when the eventEmitter from the communicationService Emit', () => {
            service['quizzes'] = [];

            service['quizCommunicationService'].quizModifiedEvent.emit();

            expect(service['quizzes']).toEqual([testQuiz]);
        });
    });
});
