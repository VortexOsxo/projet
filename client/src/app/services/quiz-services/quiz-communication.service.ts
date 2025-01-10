import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Quiz } from '@common/interfaces/quiz';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { DataSocketEvent } from '@common/enums/socket-event/data-socket-event';
import { QUIZ_SOCKET_NAME } from '@common/config/socket-config';

@Injectable({
    providedIn: 'root',
})
export class QuizCommunicationService {
    quizModifiedEvent: EventEmitter<void> = new EventEmitter<void>();

    private readonly baseUrl: string = environment.serverUrl;
    private socketService: SocketService;

    constructor(
        private readonly http: HttpClient,
        readonly socketFactoryService: SocketFactoryService,
    ) {
        this.socketService = socketFactoryService.getSocket(QUIZ_SOCKET_NAME);
        this.setupSocket();
    }

    getQuizzes(): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(`${this.baseUrl}/quiz`);
    }

    addQuiz(quiz: Quiz): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/quiz`, quiz, { observe: 'response', responseType: 'text' });
    }

    removeQuiz(quizId: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/quiz/${quizId}`, { observe: 'response', responseType: 'text' });
    }

    updateQuiz(quiz: Quiz): Observable<HttpResponse<string>> {
        return this.http.put(`${this.baseUrl}/quiz`, quiz, { observe: 'response', responseType: 'text' });
    }

    private setupSocket() {
        this.socketService.on(DataSocketEvent.QuizChangedNotification, () => {
            this.onQuizNotification();
        });
    }

    private onQuizNotification() {
        this.quizModifiedEvent.emit();
    }
}
