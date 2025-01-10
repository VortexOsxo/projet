import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Quiz } from '@common/interfaces/quiz';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { environment } from 'src/environments/environment';
import { QuizCommunicationService } from './quiz-communication.service';

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
        isVisible: false,
    },
];

describe('QuizCommunicationService', () => {
    const baseUrl: string = environment.serverUrl;
    let service: QuizCommunicationService;
    let httpMock: HttpTestingController;

    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let socketFactoryServiceSpy: jasmine.SpyObj<SocketFactoryService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on']);
        socketServiceSpy.on.and.callThrough();

        socketFactoryServiceSpy = jasmine.createSpyObj('SocketFactoryService', ['getSocket']);
        socketFactoryServiceSpy.getSocket.and.returnValue(socketServiceSpy);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuizCommunicationService, { provide: SocketFactoryService, useValue: socketFactoryServiceSpy }],
        });

        service = TestBed.inject(QuizCommunicationService);

        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should retrieve quizzes from the API via GET', () => {
        service.getQuizzes().subscribe((quizzes) => {
            expect(quizzes).toEqual(testQuizzes);
        });

        const req = httpMock.expectOne(`${baseUrl}/quiz`);
        expect(req.request.method).toBe('GET');

        req.flush(testQuizzes);
    });

    it('should add a quiz via POST request', () => {
        service.addQuiz(testQuizzes[0]).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/quiz`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(testQuizzes[0]);

        req.flush('some response');
    });

    it('should remove a quiz via DELETE request', () => {
        service.removeQuiz(testQuizzes[0].id).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/quiz/${testQuizzes[0].id}`);
        expect(req.request.method).toBe('DELETE');

        req.flush('some response');
    });

    it('should update a quiz via PUT request', () => {
        service.updateQuiz(testQuizzes[0]).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/quiz`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(testQuizzes[0]);

        req.flush('some response');
    });

    it('setupSocket should setup the on quizChangedNotification', () => {
        expect(socketServiceSpy.on).toHaveBeenCalledWith('quizChangedNotification', jasmine.any(Function));
    });

    it('should emit event when quizChangedNotification is received', () => {
        spyOn(service.quizModifiedEvent, 'emit');

        service['setupSocket']();
        const callback = socketServiceSpy.on.calls.mostRecent().args[1] as () => void;
        callback();

        expect(service.quizModifiedEvent.emit).toHaveBeenCalled();
    });
});
