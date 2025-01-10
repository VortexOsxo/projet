import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BaseInputModalComponent } from '@app/components/modal/base-input-modal/base-input-modal';
import { AdminAuthenticationService } from '@app/services/admin-authentication.service';
import { ADMIN_PASSWORD_LOGIN } from '@app/consts/game.consts';
import { GameMessage } from '@app/enums/game-message';

@Component({
    selector: 'app-admin-login-input-modal',
    templateUrl: '../base-input-modal/base-input-modal.html',
    styleUrls: ['../base-modal.scss', '../base-input-modal/base-input-modal.scss'],
})
export class AdminLoginInputModalComponent extends BaseInputModalComponent<AdminLoginInputModalComponent> {
    constructor(
        public dialogRef: MatDialogRef<AdminLoginInputModalComponent>,
        private adminAuthenticationService: AdminAuthenticationService,
    ) {
        super(dialogRef, [{ input: ADMIN_PASSWORD_LOGIN, isPassword: true }]);
    }

    async validateUserInput(): Promise<boolean> {
        if (!this.userInputs.length) return Promise.resolve(false);

        return new Promise<boolean>((resolve) => {
            this.adminAuthenticationService.attemptAuthentication(this.userInputs[0]).subscribe((result: boolean) => resolve(result));
        });
    }
    handleWrongUserInput(): void {
        this.setErrorMessage(GameMessage.WrongPassword);
    }
}
