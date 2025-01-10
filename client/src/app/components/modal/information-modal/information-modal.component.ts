import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
    selector: 'app-information-modal',
    templateUrl: './information-modal.component.html',
    styleUrls: ['../base-modal.scss'],
})
export class InformationModalComponent {
    messages: string[] | undefined;

    constructor(
        public dialogRef: MatDialogRef<InformationModalComponent>,
        @Inject(MAT_DIALOG_DATA) message: string,
    ) {
        this.messages = message.split('\n').filter((line) => line.trim() !== '');
    }

    closeModal(): void {
        this.dialogRef.close();
    }
}
