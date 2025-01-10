import { Injectable, Type } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { DIALOG_OPTIONS, DialogComponent, SNACK_BAR_DEFAULT_DURATION } from '@app/consts/dialog.consts';

@Injectable({
    providedIn: 'root',
})
export class DialogModalService {
    private openDialogRef: MatDialogRef<DialogComponent> | undefined;

    constructor(
        private dialog: MatDialog,
        private matSnackBar: MatSnackBar,
    ) {}

    openModal(componentType: Type<DialogComponent>) {
        this.closeModals();
        this.openDialogRef = this.dialog.open(componentType, DIALOG_OPTIONS);
    }

    closeModals() {
        this.openDialogRef?.close();
        this.openDialogRef = undefined;
    }

    openSnackBar(message: string, duration?: number) {
        const config = new MatSnackBarConfig();
        config.duration = duration ?? SNACK_BAR_DEFAULT_DURATION;
        config.horizontalPosition = 'end';
        config.verticalPosition = 'bottom';

        this.matSnackBar.open(message, 'Fermer', config);
    }
}
