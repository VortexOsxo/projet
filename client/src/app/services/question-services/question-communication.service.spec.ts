import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { QuestionType } from '@common/enums/question-type';
import { Question } from '@common/interfaces/question';
import { environment } from 'src/environments/environment';
import { QuestionCommunicationService } from './question-communication.service';

const testQuestions: Question[] = [
    {
        id: '2000',
        text: 'Capitales',
        lastModification: new Date(),
        points: 20,
        type: QuestionType.QCM,
        choices: [],
    },
    {
        id: '2001',
        text: 'Animaux',
        lastModification: new Date(),
        points: 40,
        type: QuestionType.QCM,
        choices: [],
    },
];

describe('QuestionCommunicationService', () => {
    const baseUrl: string = environment.serverUrl;
    let service: QuestionCommunicationService;
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
            providers: [QuestionCommunicationService, { provide: SocketFactoryService, useValue: socketFactoryServiceSpy }],
        });
        service = TestBed.inject(QuestionCommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should retrieve questions from the API via GET', () => {
        service.getQuestions().subscribe((questions) => {
            expect(questions).toEqual(testQuestions);
        });

        const req = httpMock.expectOne(`${baseUrl}/question`);
        expect(req.request.method).toBe('GET');

        req.flush(testQuestions);
    });

    it('should retrieve a question by ID from the API via GET', () => {
        const questionId = '2000';
        service.getQuestion(questionId).subscribe((question) => {
            expect(question).toEqual(testQuestions[0]);
        });

        const req = httpMock.expectOne(`${baseUrl}/question/${questionId}`);
        expect(req.request.method).toBe('GET');

        req.flush(testQuestions[0]);
    });

    it('should add a question via POST request', () => {
        service.addQuestion(testQuestions[0]).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/question`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(testQuestions[0]);

        req.flush('some response');
    });

    it('should update a question via PUT request', () => {
        service.updateQuestion(testQuestions[0]).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/question`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(testQuestions[0]);

        req.flush('some response');
    });

    it('should delete a question by ID via DELETE request', () => {
        const questionId = '2000';
        service.deleteQuestion(questionId).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/question/${questionId}`);
        expect(req.request.method).toBe('DELETE');

        req.flush('some response');
    });

    it('setupSocket should setup the on questionChangedNotification', () => {
        expect(socketServiceSpy.on).toHaveBeenCalledWith('questionChangedNotification', jasmine.any(Function));
    });

    it('should emit event when questionChangedNotification is received', () => {
        spyOn(service.questionsUpdatedEvent, 'emit');

        service['setupSocket']();
        const callback = socketServiceSpy.on.calls.mostRecent().args[1] as () => void;
        callback();

        expect(service.questionsUpdatedEvent.emit).toHaveBeenCalled();
    });
});
