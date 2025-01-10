import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GameJoiningService } from '@app/services/game-services/game-joining.service';
import { Response } from '@common/interfaces/response';
import { GameIdInputModalComponent } from './game-id-input-modal.component';

describe('GameIdInputModalComponent', () => {
    let component: GameIdInputModalComponent;
    let fixture: ComponentFixture<GameIdInputModalComponent>;
    let gameJoinerServiceMock: jasmine.SpyObj<GameJoiningService>;

    beforeEach(() => {
        gameJoinerServiceMock = jasmine.createSpyObj('GameJoinerService', ['joinGame']);

        TestBed.configureTestingModule({
            declarations: [GameIdInputModalComponent],
            imports: [MatDialogModule, FormsModule],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: GameJoiningService, useValue: gameJoinerServiceMock },
            ],
        });
        fixture = TestBed.createComponent(GameIdInputModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('validateUserInput', () => {
        it('should call the GameJoinerService to attempt to join a game', async () => {
            const mockResponse: Response = { message: 'Hello', success: true };
            const expectedArgument = '1234';

            gameJoinerServiceMock.joinGame.and.returnValue(Promise.resolve(mockResponse));
            component.userInputs = [expectedArgument];

            await component.validateUserInput();
            expect(gameJoinerServiceMock.joinGame).toHaveBeenCalledWith(parseInt(expectedArgument, 10));
        });

        it('should return false without querying the server if userInputs is empty', async () => {
            component.userInputs = [];
            const result = await component.validateUserInput();

            expect(result).toBeFalse();
            expect(gameJoinerServiceMock.joinGame).not.toHaveBeenCalled();
        });

        it('should return false without querying the server if userInputs is not a number', async () => {
            component.userInputs = ['not a number'];
            const result = await component.validateUserInput();

            expect(result).toBeFalse();
            expect(gameJoinerServiceMock.joinGame).not.toHaveBeenCalled();
        });

        it('should return false without querying the server if userInputs is not a 4 digit number', async () => {
            component.userInputs = ['19999'];
            const result = await component.validateUserInput();

            expect(result).toBeFalse();
            expect(gameJoinerServiceMock.joinGame).not.toHaveBeenCalled();
        });

        it('should set error message when calling handleWrongUserInput', () => {
            const expectedErrorMessage = 'Entrez une valeur valide';
            const setErrorMessageSpy: jasmine.Spy<(message: string) => void> = spyOn(component, 'setErrorMessage');

            component.handleWrongUserInput();

            expect(setErrorMessageSpy).toHaveBeenCalledWith(expectedErrorMessage);
        });
    });
});
