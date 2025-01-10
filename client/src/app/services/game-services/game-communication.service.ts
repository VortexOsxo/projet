import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { GameHistory } from '@common/interfaces/game-history';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SocketService } from '@app/services/socket-service/socket.service';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { GAME_HISTORY_SOCKET_NAME } from '@common/config/socket-config';
import { DataSocketEvent } from '@common/enums/socket-event/data-socket-event';

@Injectable({
    providedIn: 'root',
})
export class GameCommunicationService {
    gameHistoryModified: EventEmitter<void> = new EventEmitter<void>();

    private readonly baseUrl: string = environment.serverUrl;
    private socketService: SocketService;

    constructor(
        private readonly http: HttpClient,
        readonly socketFactoryService: SocketFactoryService,
    ) {
        this.socketService = socketFactoryService.getSocket(GAME_HISTORY_SOCKET_NAME);
        this.setupSocket();
    }

    getGames(): Observable<GameHistory[]> {
        return this.http.get<GameHistory[]>(`${this.baseUrl}/game-history`);
    }

    deleteGames(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/game-history`, { observe: 'response', responseType: 'text' });
    }

    private setupSocket() {
        this.socketService.on(DataSocketEvent.GameHistoryChangedNotification, () => {
            this.onQuizNotification();
        });
    }

    private onQuizNotification() {
        this.gameHistoryModified.emit();
    }
}
