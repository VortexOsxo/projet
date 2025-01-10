import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogModalService } from './dialog-modal.service';
import { DIALOG_OPTIONS } from '@app/consts/dialog.consts';
import { Component } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-mock-dialog',
    template: '<div>Mock Dialog Component</div>',
})
export class MockDialogComponent {}

describe('DialogModalService', () => {
    let service: DialogModalService;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('MatDialog', ['open', 'close']);

        TestBed.configureTestingModule({
            providers: [DialogModalService, { provide: MatDialog, useValue: spy }],
            imports: [MatDialogModule, MatSnackBarModule],
        });

        service = TestBed.inject(DialogModalService);
        dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should open modal dialog', () => {
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        dialogSpy.open.and.returnValue(mockDialogRef);

        service.openModal(MockDialogComponent);

        expect(dialogSpy.open).toHaveBeenCalledWith(MockDialogComponent, DIALOG_OPTIONS);
    });

    it('should close modal dialog', () => {
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        service['openDialogRef'] = mockDialogRef;

        service.closeModals();

        expect(mockDialogRef.close).toHaveBeenCalled();
        expect(service['openDialogRef']).toBeUndefined();
    });
});
