import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InformationModalComponent } from './information-modal.component';
import { MatIconModule } from '@angular/material/icon';

describe('InformationModalComponent', () => {
    let component: InformationModalComponent;
    let fixture: ComponentFixture<InformationModalComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<InformationModalComponent>>;

    beforeEach(() => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        TestBed.configureTestingModule({
            declarations: [InformationModalComponent],
            imports: [MatDialogModule, MatIconModule],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: 'Hello' },
            ],
        });
        fixture = TestBed.createComponent(InformationModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the modal', () => {
        component.closeModal();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should setup multiline message correctly', () => {
        const multilineMessage = 'Hello World\nBye World';
        const expectedMessages = ['Hello World', 'Bye World'];

        component = new InformationModalComponent(dialogRefSpy, multilineMessage);

        expect(component.messages).toEqual(expectedMessages);
    });

    it('should handle singleline message correctly', () => {
        const singlelineMessage = 'Hello World';
        const expectedMessages = ['Hello World'];

        component = new InformationModalComponent(dialogRefSpy, singlelineMessage);

        expect(component.messages).toEqual(expectedMessages);
    });

    it('should not add empty line', () => {
        const singlelineMessage = 'Hello World\n    ';
        const expectedMessages = ['Hello World'];

        component = new InformationModalComponent(dialogRefSpy, singlelineMessage);

        expect(component.messages).toEqual(expectedMessages);
    });

    it('should not cause error if message is empty', () => {
        const singlelineMessage = '';
        const expectedMessages: string[] = [];

        component = new InformationModalComponent(dialogRefSpy, singlelineMessage);

        expect(component.messages).toEqual(expectedMessages);
    });
});
