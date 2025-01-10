import { MatDialogRef } from '@angular/material/dialog';
import { Directive } from '@angular/core';
import { ModalInputConfig } from '@app/interfaces/modal-input-config';
import { GameMessage } from '@app/enums/game-message';

@Directive()
export abstract class BaseInputModalComponent<T> {
    userInputs: string[] = [];
    errorMessage: string = '';

    private inputs: string[] = [];
    private arePasswords: boolean[] = [];

    constructor(
        public dialogRef: MatDialogRef<T>,
        inputs: ModalInputConfig[],
    ) {
        inputs.forEach((inputConfig) => {
            this.inputs.push(inputConfig.input);
            this.arePasswords.push(inputConfig.isPassword);
        });
    }

    getInputs(): string[] {
        return this.inputs;
    }

    getInputType(number: number): string {
        return this.arePasswords[number] ? 'password' : 'text';
    }

    onKeyPress(event: KeyboardEvent): void {
        if (event.key === 'Enter') this.submitInput();
        else if (event.key === 'Escape' || event.key === 'Esc') this.closeModal();
    }

    closeModal(): void {
        this.dialogRef.close();
    }

    async submitInput(): Promise<void> {
        const isValid = await this.validateUserInput();
        if (isValid) {
            this.dialogRef.close(true);
        } else {
            this.handleWrongUserInput();
        }
    }

    setErrorMessage(message: string): void {
        this.errorMessage = message;
    }

    handleWrongUserInput(): void {
        this.setErrorMessage(GameMessage.WrongInputDefault);
    }

    abstract validateUserInput(): Promise<boolean>;
}
