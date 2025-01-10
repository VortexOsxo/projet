import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Response } from '@common/interfaces/response';
import { GameInputModalBaseComponent } from './game-input-modal-base.component';
import { GameMessage } from '@app/enums/game-message';

@Component({})
class TestGameBaseInputModalComponent extends GameInputModalBaseComponent<TestGameBaseInputModalComponent> {
    constructor(dialogRef: MatDialogRef<TestGameBaseInputModalComponent>) {
        super(dialogRef, [{ input: 'mockInput', isPassword: false }]);
    }

    async validateUserInput(): Promise<boolean> {
        return Promise.resolve(true);
    }
}

describe('GameInputModalBaseComponent', () => {
    let component: TestGameBaseInputModalComponent;
    let fixture: ComponentFixture<TestGameBaseInputModalComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<TestGameBaseInputModalComponent>>;

    beforeEach(async () => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            declarations: [TestGameBaseInputModalComponent],
            imports: [MatDialogModule],
            providers: [{ provide: MatDialogRef, useValue: dialogRefSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestGameBaseInputModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle response', async () => {
        const defaultMessage = 'Default message';
        const successResponse: Response = { success: true };
        const failResponse: Response = { success: false, message: 'Error message' };

        let result = await component.handleResponse(successResponse, defaultMessage);
        expect(result).toBe(true);
        expect(component.errorMessage).toBeFalsy();

        result = await component.handleResponse(failResponse, defaultMessage);
        expect(result).toBe(false);
        expect(component.errorMessage).toBe('Error message');

        result = await component.handleResponse({ success: false }, defaultMessage);
        expect(result).toBe(false);
        expect(component.errorMessage).toBe(defaultMessage);
    });

    it('should submit input', async () => {
        spyOn(component, 'validateUserInput').and.returnValue(Promise.resolve(true));

        await component.submitInput();
        expect(component.validateUserInput).toHaveBeenCalled();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });

    it('should verify input format', () => {
        component.userInputs = [''];
        let result = component['verifyInputFormat']();
        expect(result).toBe(false);
        expect(component.errorMessage).toBe(GameMessage.EmptyField);

        component.userInputs = ['Some input'];
        component.errorMessage = '';
        result = component['verifyInputFormat']();
        expect(result).toBe(true);
        expect(component.errorMessage).toBeFalsy();
    });
});
