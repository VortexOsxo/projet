import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GameJoiningService } from '@app/services/game-services/game-joining.service';
import { Response } from '@common/interfaces/response';
import { GameUsernameInputModalComponent } from './game-username-input-modal.component';

describe('GameUsernameInputModalComponent', () => {
    let component: GameUsernameInputModalComponent;
    let fixture: ComponentFixture<GameUsernameInputModalComponent>;
    let gameJoiningServiceMock: jasmine.SpyObj<GameJoiningService>;

    beforeEach(() => {
        gameJoiningServiceMock = jasmine.createSpyObj('GameJoiningService', ['setUsername']);

        TestBed.configureTestingModule({
            declarations: [GameUsernameInputModalComponent],
            imports: [MatDialogModule, FormsModule],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: GameJoiningService, useValue: gameJoiningServiceMock },
            ],
        });
        fixture = TestBed.createComponent(GameUsernameInputModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('validateUserInput', () => {
        it('should call the GameJoiningService to attempt to join a game', async () => {
            const mockResponse: Response = { message: 'mock', success: true };
            const expectedArgument = 'name';
            gameJoiningServiceMock.setUsername.and.returnValue(Promise.resolve(mockResponse));
            component.userInputs = [expectedArgument];

            await component.validateUserInput();
            expect(gameJoiningServiceMock.setUsername).toHaveBeenCalledWith(expectedArgument);
        });

        it('should return false without querying the server if userInputs is empty', async () => {
            component.userInputs = [];
            const result = await component.validateUserInput();

            expect(result).toBeFalse();
            expect(gameJoiningServiceMock.setUsername).not.toHaveBeenCalled();
        });

        it('should return false without querying the server if userInputs is an empty string', async () => {
            component.userInputs = [''];
            const result = await component.validateUserInput();

            expect(result).toBeFalse();
            expect(gameJoiningServiceMock.setUsername).not.toHaveBeenCalled();
        });

        it('should return false without querying the server if userInputs is a white space string', async () => {
            component.userInputs = ['   '];
            const result = await component.validateUserInput();

            expect(result).toBeFalse();
            expect(gameJoiningServiceMock.setUsername).not.toHaveBeenCalled();
        });

        it('should set error message when calling handleWrongUserInput', () => {
            const expectedErrorMessage = 'Entrez une valeur valide';
            const setErrorMessageSpy: jasmine.Spy<(message: string) => void> = spyOn(component, 'setErrorMessage');

            component.handleWrongUserInput();

            expect(setErrorMessageSpy).toHaveBeenCalledWith(expectedErrorMessage);
        });
    });
});
