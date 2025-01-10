import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AdminLoginInputModalComponent } from './admin-login-input-modal.component';
import { FormsModule } from '@angular/forms';
import { AdminAuthenticationService } from '@app/services/admin-authentication.service';
import { of } from 'rxjs';

describe('AdminLoginInputModalComponent', () => {
    let component: AdminLoginInputModalComponent;
    let fixture: ComponentFixture<AdminLoginInputModalComponent>;
    let mockAuthService: jasmine.SpyObj<AdminAuthenticationService>;

    beforeEach(() => {
        mockAuthService = jasmine.createSpyObj<AdminAuthenticationService>(['attemptAuthentication']);

        TestBed.configureTestingModule({
            declarations: [AdminLoginInputModalComponent],
            imports: [MatDialogModule, FormsModule],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: AdminAuthenticationService, useValue: mockAuthService },
            ],
        });
        fixture = TestBed.createComponent(AdminLoginInputModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set error message when calling handleWrongUserInput', () => {
        const expectedErrorMessage = 'Le mot de passe est invalide';
        const setErrorMessageSpy: jasmine.Spy<(message: string) => void> = spyOn(component, 'setErrorMessage');

        component.handleWrongUserInput();

        expect(setErrorMessageSpy).toHaveBeenCalledWith(expectedErrorMessage);
    });

    describe('validateUserInput', () => {
        it('should call the admin authentication service to attempt to authenticate', async () => {
            const expectedArgument = 'some-password';
            mockAuthService.attemptAuthentication.and.returnValue(of(true));
            component.userInputs = [expectedArgument];
            await component.validateUserInput();
            expect(mockAuthService.attemptAuthentication).toHaveBeenCalledWith(expectedArgument);
        });

        it('should return false if userInputs is empty', async () => {
            component.userInputs = [];
            const result = await component.validateUserInput();
            expect(result).toBeFalse();
        });
    });
});
