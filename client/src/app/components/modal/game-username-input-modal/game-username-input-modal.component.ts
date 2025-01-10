import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GameJoiningService } from '@app/services/game-services/game-joining.service';
import { Response } from '@common/interfaces/response';
import { GameInputModalBaseComponent } from '@app/components/modal/game-input-modal-base/game-input-modal-base.component';
import { PSEUDONYME } from '@app/consts/game.consts';
import { GameMessage } from '@app/enums/game-message';

@Component({
    selector: 'app-game-username-input-modal',
    templateUrl: '../base-input-modal/base-input-modal.html',
    styleUrls: ['../base-modal.scss', '../base-input-modal/base-input-modal.scss'],
})
export class GameUsernameInputModalComponent extends GameInputModalBaseComponent<GameUsernameInputModalComponent> {
    constructor(
        dialogRef: MatDialogRef<GameUsernameInputModalComponent>,
        private gameJoiningService: GameJoiningService,
    ) {
        super(dialogRef, [{ input: PSEUDONYME, isPassword: false }]);
    }

    async validateUserInput(): Promise<boolean> {
        if (!this.verifyInputFormat()) return Promise.resolve(false);

        const response: Response = await this.gameJoiningService.setUsername(this.userInputs[0]);
        return this.handleResponse(response, GameMessage.WrongUsernameDefault);
    }
}
