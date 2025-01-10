import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { BaseInputModalComponent } from './base-input-modal';
import { Component } from '@angular/core';

describe('BaseInputModalComponent', () => {
    const input1 = 'input1';
    const input2 = 'input2';

    @Component({
        template: '',
    })
    class TestInputModalComponent extends BaseInputModalComponent<TestInputModalComponent> {
        constructor(public dialogRef: MatDialogRef<TestInputModalComponent>) {
            super(dialogRef, [
                { input: input1, isPassword: false },
                { input: input2, isPassword: true },
            ]);
        }
        async validateUserInput(): Promise<boolean> {
            return Promise.resolve(true);
        }
    }

    let component: TestInputModalComponent;
    let fixture: ComponentFixture<TestInputModalComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<TestInputModalComponent>>;

    beforeEach(() => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        TestBed.configureTestingModule({
            declarations: [TestInputModalComponent],
            imports: [MatDialogModule],
            providers: [{ provide: MatDialogRef, useValue: dialogRefSpy }],
        });

        fixture = TestBed.createComponent(TestInputModalComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Accessing inputs and their type', () => {
        it('inputs getter should properly return the inputs', () => {
            expect(component.getInputs()).toEqual([input1, input2]);
        });
        it('getInputType should properly return the type of the inputs', () => {
            const expectedTextType = 'text';
            const expectedPasswordType = 'password';

            expect(component.getInputType(0)).toBe(expectedTextType);
            expect(component.getInputType(1)).toBe(expectedPasswordType);
        });
    });

    describe('dialog related method', () => {
        it('should close the modal', () => {
            component.closeModal();
            expect(dialogRefSpy.close).toHaveBeenCalled();
        });

        it('if the input are not valid, should not close the modal and call the handleWrongUserInput method', async () => {
            spyOn(component, 'validateUserInput').and.returnValue(Promise.resolve(false));
            const handleWrongUserInputSpy: jasmine.Spy<() => void> = spyOn(component, 'handleWrongUserInput');

            await component.submitInput();

            expect(dialogRefSpy.close).not.toHaveBeenCalled();
            expect(handleWrongUserInputSpy).toHaveBeenCalled();
        });

        it('if the input are valid, should close the modal and not call the handleWrongUserInput method', async () => {
            spyOn(component, 'validateUserInput').and.returnValue(Promise.resolve(true));
            const handleWrongUserInputSpy: jasmine.Spy<() => void> = spyOn(component, 'handleWrongUserInput');

            await component.submitInput();

            expect(dialogRefSpy.close).toHaveBeenCalled();
            expect(handleWrongUserInputSpy).not.toHaveBeenCalled();
        });
    });

    describe('Handling shortcut key', () => {
        it('should call submitInput when Enter key is pressed', () => {
            const eventEnter = new KeyboardEvent('keypress', { key: 'Enter' });
            const submitInputSpy: jasmine.Spy<() => void> = spyOn(component, 'submitInput');

            component.onKeyPress(eventEnter);

            expect(submitInputSpy).toHaveBeenCalled();
        });

        it('should call closeModal when Escape key is pressed', () => {
            const eventEscape = new KeyboardEvent('keypress', { key: 'Escape' });
            const closeModalSpy: jasmine.Spy<() => void> = spyOn(component, 'closeModal');

            component.onKeyPress(eventEscape);

            expect(closeModalSpy).toHaveBeenCalled();
        });

        it('should not call submitInput or closeModal for other keys', () => {
            const otherKeyEvent = new KeyboardEvent('keypress', { key: 'A' });
            const submitInputSpy: jasmine.Spy<() => void> = spyOn(component, 'submitInput');
            const closeModalSpy: jasmine.Spy<() => void> = spyOn(component, 'closeModal');

            component.onKeyPress(otherKeyEvent);

            expect(submitInputSpy).not.toHaveBeenCalled();
            expect(closeModalSpy).not.toHaveBeenCalled();
        });
    });

    it('Should correctly change the error message', () => {
        const expectedMessage = 'Error message';
        component.setErrorMessage(expectedMessage);

        expect(component.errorMessage).toEqual(expectedMessage);
    });

    it('should set error message when calling handleWrongUserInput', () => {
        const expectedErrorMessage = 'Entrez une valeur valide';
        const setErrorMessageSpy: jasmine.Spy<(message: string) => void> = spyOn(component, 'setErrorMessage');

        component.handleWrongUserInput();

        expect(setErrorMessageSpy).toHaveBeenCalledWith(expectedErrorMessage);
    });
});
