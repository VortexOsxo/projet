import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserGameState } from '@common/enums/user-game-state';
import { GameStateService } from '@app/services/game-services/game-state.service';
import { Subscription } from 'rxjs';
import { GameLeavingService } from '@app/services/game-services/game-leaving.service';
import { DialogModalService } from '@app/services/dialog-modal.service';
import { IntermissionComponent } from '@app/components/intermission/intermission.component';
import { OrganizerCorrectionComponent } from '@app/components/correction/organizer-correction/organizer-correction.component';
import { LoadingComponent } from '@app/components/loading/loading.component';
import { PlayerCorrectionComponent } from '@app/components/correction/player-correction/player-correction.component';

@Component({
    selector: 'app-game-parent-page',
    templateUrl: './game-parent-page.component.html',
    styleUrls: ['./game-parent-page.component.scss'],
})
export class GameParentPageComponent implements OnInit, OnDestroy {
    userState: UserGameState;
    isOrganiser: boolean;
    reloadComponent: boolean;

    private gameStateSubscription: Subscription;
    private isOrganiserSubscription: Subscription;

    constructor(
        private gameStateService: GameStateService,
        private leavingGameService: GameLeavingService,
        private dialogModalService: DialogModalService,
    ) {
        this.reloadComponent = false;
    }

    ngOnInit(): void {
        this.isOrganiserSubscription = this.gameStateService.getIsOrganizerObservable().subscribe((isOrganiser) => (this.isOrganiser = isOrganiser));
        this.gameStateSubscription = this.gameStateService.getStateObservable().subscribe((newState) => this.onStateChange(newState));
    }

    ngOnDestroy(): void {
        this.isOrganiserSubscription.unsubscribe();
        this.gameStateSubscription.unsubscribe();
        this.leavingGameService.leaveGame();
    }

    reload() {
        this.reloadComponent = true;
        setTimeout(() => (this.reloadComponent = false));
    }

    private onStateChange(newState: UserGameState): void {
        this.dialogModalService.closeModals();

        switch (newState) {
            case this.userState:
                this.reload();
                break;
            case UserGameState.Intermission:
                this.dialogModalService.openModal(IntermissionComponent);
                break;
            case UserGameState.Correction:
                this.dialogModalService.openModal(this.isOrganiser ? OrganizerCorrectionComponent : PlayerCorrectionComponent);
                break;
            case UserGameState.Loading:
                this.dialogModalService.openModal(LoadingComponent);
                break;
            default:
                this.userState = newState;
                break;
        }
    }
}
