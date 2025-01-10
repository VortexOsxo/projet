import { TestBed } from '@angular/core/testing';
import { ValidationBaseService } from './validation-base.service';

describe('ValidationBaseService', () => {
    let service: ValidationBaseService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ValidationBaseService],
        });
        service = TestBed.inject(ValidationBaseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create valid input validity', () => {
        const inputValidity = service['createValidInputValidity']();
        expect(inputValidity.isValid).toBe(true);
        expect(inputValidity.errorMessage).toBe('');
    });

    it('should create invalid input validity with error message', () => {
        const errorMessage = 'Invalid input';
        const inputValidity = service['createInvalidInputValidity'](errorMessage);
        expect(inputValidity.isValid).toBe(false);
        expect(inputValidity.errorMessage).toBe(errorMessage);
    });

    it('should validate text', () => {
        const validText = 'Valid text';
        const invalidText = '';
        const message = 'Text is required';
        const validInputValidity = service['validateText'](validText, message);
        const invalidInputValidity = service['validateText'](invalidText, message);

        expect(validInputValidity.isValid).toBe(true);
        expect(validInputValidity.errorMessage).toBe(invalidText);

        expect(invalidInputValidity.isValid).toBe(false);
        expect(invalidInputValidity.errorMessage).toBe(message);
    });

    it('should modify input validity', () => {
        const initialInputValidity = { isValid: false, errorMessage: 'Initial error message' };
        const resultingInputValidity = { isValid: true, errorMessage: '' };
        const modifiedInputValidity = service['modifyInputValidity'](initialInputValidity, resultingInputValidity);
        expect(modifiedInputValidity.isValid).toBe(false);
        expect(modifiedInputValidity.errorMessage).toBe('Initial error message\n');
    });
});
