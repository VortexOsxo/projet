import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GameJoiningService } from '@app/services/game-services/game-joining.service';
import { GameInputModalBaseComponent } from '@app/components/modal/game-input-modal-base/game-input-modal-base.component';
import { GAME_ID, MAXIMUM_GAME_ID, MINIMUM_GAME_ID } from '@app/consts/game.consts';
import { GameMessage } from '@app/enums/game-message';

@Component({
    selector: 'app-game-id-input-modal',
    templateUrl: '../base-input-modal/base-input-modal.html',
    styleUrls: ['../base-modal.scss', '../base-input-modal/base-input-modal.scss'],
})
export class GameIdInputModalComponent extends GameInputModalBaseComponent<GameIdInputModalComponent> {
    constructor(
        dialogRef: MatDialogRef<GameIdInputModalComponent>,
        private gameJoiningService: GameJoiningService,
    ) {
        super(dialogRef, [{ input: GAME_ID, isPassword: false }]);
    }

    async validateUserInput(): Promise<boolean> {
        if (!this.verifyInputFormat()) return Promise.resolve(false);

        const gameIdInputed = this.getGameIdFromInput();
        const response = await this.gameJoiningService.joinGame(gameIdInputed);
        return this.handleResponse(response, GameMessage.WrongGameIDDefault);
    }

    protected verifyInputFormat(): boolean {
        if (!super.verifyInputFormat()) return false;

        if (!this.validateGameIdInput()) {
            this.setErrorMessage(GameMessage.GameIDFormatError);
            return false;
        }
        return true;
    }

    private validateGameIdInput() {
        const gameIdInput = this.getGameIdFromInput();
        return gameIdInput && gameIdInput >= MINIMUM_GAME_ID && gameIdInput <= MAXIMUM_GAME_ID;
    }

    private getGameIdFromInput() {
        return parseInt(this.userInputs[0], 10);
    }
}
