import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Player } from '@common/interfaces/player';
import { GameInfoService } from '@app/services/game-services/game-info.service';
import { GameLobbyService } from '@app/services/game-services/game-lobby.service';
import { GamePlayersStatService } from '@app/services/game-services/game-players-stat.service';
import { WaitViewComponent } from './wait-view.component';
import { LogoTitleComponent } from '@app/components/logo-title/logo-title.component';
import { Component } from '@angular/core';
import { PlayerState } from '@common/enums/user-answer-state';

@Component({
    selector: 'app-chat',
    template: '<p>Mock Chat Component</p>',
})
class MockChatComponent {}

describe('WaitViewComponent', () => {
    let component: WaitViewComponent;
    let fixture: ComponentFixture<WaitViewComponent>;
    let gameInfoServiceSpy: jasmine.SpyObj<GameInfoService>;
    let gameLobbyServiceSpy: jasmine.SpyObj<GameLobbyService>;
    let gamePlayersStatServiceSpy: jasmine.SpyObj<GamePlayersStatService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let mockPlayers: Player[];

    beforeEach(() => {
        mockPlayers = [
            { name: 'Player 1', score: 0, bonusCount: 0, answerState: PlayerState.ANSWERING },
            { name: 'Player 2', score: 0, bonusCount: 0, answerState: PlayerState.NO_ANSWER },
        ];
        gameInfoServiceSpy = jasmine.createSpyObj('GameInfoService', ['getGameId']);
        gameLobbyServiceSpy = jasmine.createSpyObj('GameLobbyService', ['startGame', 'toggleLobbyLock', 'banPlayer', 'canStartGame', 'resetState']);
        gamePlayersStatServiceSpy = jasmine.createSpyObj('GamePlayersStatService', ['getPlayersObservable', 'filterByPlayerInGame']);

        gamePlayersStatServiceSpy.getPlayersObservable.and.returnValue(of(mockPlayers));

        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        TestBed.configureTestingModule({
            declarations: [WaitViewComponent, LogoTitleComponent, MockChatComponent],
            providers: [
                { provide: GameInfoService, useValue: gameInfoServiceSpy },
                { provide: GameLobbyService, useValue: gameLobbyServiceSpy },
                { provide: GamePlayersStatService, useValue: gamePlayersStatServiceSpy },
                { provide: MatDialog, useValue: dialogSpy },
            ],
        });
        fixture = TestBed.createComponent(WaitViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call startGame on gameLobbyService when startGame is called', () => {
        component.startGame();
        expect(gameLobbyServiceSpy.startGame).toHaveBeenCalled();
    });

    it('should call canStartGame to know if it can startGame', () => {
        gameLobbyServiceSpy.canStartGame.and.returnValue(false);

        expect(component.canStartGame()).toEqual(false);
        expect(gameLobbyServiceSpy.canStartGame).toHaveBeenCalled();
    });

    it('should toggle roomLocked when toggleLobbyLock is called', () => {
        component.toggleLobbyLock();

        expect(gameLobbyServiceSpy.toggleLobbyLock).toHaveBeenCalled();
    });

    it('should call banPlayer on gameLobbyService when removePlayer is called', () => {
        const player: Player = mockPlayers[0];
        const result = true;
        dialogSpy.open.and.returnValue({ afterClosed: () => of(result) } as MatDialogRef<unknown, unknown>);

        component.removePlayer(player);

        expect(dialogSpy.open).toHaveBeenCalled();
        expect(gameLobbyServiceSpy.banPlayer).toHaveBeenCalledWith(player.name);
    });
});
