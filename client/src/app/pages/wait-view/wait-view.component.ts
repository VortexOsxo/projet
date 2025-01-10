import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Player } from '@common/interfaces/player';
import { GameLobbyService } from '@app/services/game-services/game-lobby.service';
import { ConfirmationModalComponent } from '@app/components/modal/confirmation-modal/confirmation-modal.component';

@Component({
    selector: 'app-wait-view',
    templateUrl: './wait-view.component.html',
    styleUrls: ['./wait-view.component.scss'],
})
export class WaitViewComponent implements OnInit {
    @Input() isOrganiser: boolean = true;

    constructor(
        private gameLobbyService: GameLobbyService,
        private dialog: MatDialog,
    ) {}

    get roomLocked() {
        return this.gameLobbyService.isLobbyLocked;
    }

    get players() {
        return this.gameLobbyService.players;
    }

    get gameId(): number {
        return this.gameLobbyService.gameId;
    }

    ngOnInit(): void {
        this.gameLobbyService.resetState();
    }

    startGame() {
        this.gameLobbyService.startGame();
    }

    canStartGame(): boolean {
        return this.gameLobbyService.canStartGame();
    }

    toggleLobbyLock() {
        this.gameLobbyService.toggleLobbyLock();
    }

    removePlayer(player: Player) {
        const message = 'Êtes-vous sûr de vouloir bannir ' + player.name + '?';
        const dialogRef = this.dialog.open(ConfirmationModalComponent, { data: message, autoFocus: false });
        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) this.gameLobbyService.banPlayer(player.name);
        });
    }
}
