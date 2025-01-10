import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation-modal',
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent {
    messages: string[] | undefined;

    constructor(
        public dialogRef: MatDialogRef<ConfirmationModalComponent>,
        @Inject(MAT_DIALOG_DATA) message: string,
    ) {
        this.messages = message.split('\n').filter((line) => line.trim() !== '');
    }

    confirm(): void {
        this.dialogRef.close(true);
    }

    closeModal(): void {
        this.dialogRef.close();
    }
}
