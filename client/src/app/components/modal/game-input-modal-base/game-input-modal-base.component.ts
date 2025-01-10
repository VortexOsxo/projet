import { Directive } from '@angular/core';
import { BaseInputModalComponent } from '@app/components/modal/base-input-modal/base-input-modal';
import { GameMessage } from '@app/enums/game-message';
import { Response } from '@common/interfaces/response';

@Directive()
export abstract class GameInputModalBaseComponent<T> extends BaseInputModalComponent<T> {
    async submitInput(): Promise<void> {
        if (await this.validateUserInput()) this.dialogRef.close(true);
    }

    async handleResponse(response: Response, defaultMessage: string): Promise<boolean> {
        if (!response.success) this.setErrorMessage(response.message ?? defaultMessage);
        return response.success;
    }

    protected verifyInputFormat(): boolean {
        if (!(this.userInputs[0] && this.userInputs[0].trim())) {
            this.setErrorMessage(GameMessage.EmptyField);
            return false;
        }
        return true;
    }
}
