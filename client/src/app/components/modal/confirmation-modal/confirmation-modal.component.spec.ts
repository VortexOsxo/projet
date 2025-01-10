import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationModalComponent } from './confirmation-modal.component';

describe('ConfirmationModalComponent', () => {
    let component: ConfirmationModalComponent;
    let fixture: ComponentFixture<ConfirmationModalComponent>;
    let matDialogRefMock: jasmine.SpyObj<MatDialogRef<ConfirmationModalComponent>>;

    beforeEach(() => {
        matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        TestBed.configureTestingModule({
            declarations: [ConfirmationModalComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRefMock },
                { provide: MAT_DIALOG_DATA, useValue: 'Message\nMessage2' },
            ],
        });
        fixture = TestBed.createComponent(ConfirmationModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should split messages correctly', () => {
        expect(component.messages).toEqual(['Message', 'Message2']);
    });

    it('should close dialog on confirm', () => {
        component.confirm();
        expect(matDialogRefMock.close).toHaveBeenCalledWith(true);
    });

    it('should close dialog on close', () => {
        component.closeModal();
        expect(matDialogRefMock.close).toHaveBeenCalled();
    });
});
