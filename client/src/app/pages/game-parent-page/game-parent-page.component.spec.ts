import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GameParentPageComponent } from './game-parent-page.component';
import { GameStateService } from '@app/services/game-services/game-state.service';
import { GameLeavingService } from '@app/services/game-services/game-leaving.service';
import { of } from 'rxjs';
import { UserGameState } from '@common/enums/user-game-state';
import { DialogModalService } from '@app/services/dialog-modal.service';
import { IntermissionComponent } from '@app/components/intermission/intermission.component';
import { OrganizerCorrectionComponent } from '@app/components/correction/organizer-correction/organizer-correction.component';
import { PlayerCorrectionComponent } from '@app/components/correction/player-correction/player-correction.component';
import { LoadingComponent } from '@app/components/loading/loading.component';
import { MockPlayerGameViewComponent } from './mock-player-game-view.component.spec';
import { MockOrganizerGameViewComponent } from './mock-organizer-game-view.component.spec';

const ONE_SECOND = 1000;

describe('GameParentPageComponent', () => {
    let component: GameParentPageComponent;
    let fixture: ComponentFixture<GameParentPageComponent>;

    let mockGameStateService: jasmine.SpyObj<GameStateService>;
    let mockLeavingGameService: jasmine.SpyObj<GameLeavingService>;
    let mockDialogModalService: jasmine.SpyObj<DialogModalService>;

    beforeEach(async () => {
        mockGameStateService = jasmine.createSpyObj('GameStateService', ['getIsOrganizerObservable', 'getStateObservable']);
        mockGameStateService.getStateObservable.and.returnValue(of(UserGameState.InGame));
        mockGameStateService.getIsOrganizerObservable.and.returnValue(of(true));

        mockLeavingGameService = jasmine.createSpyObj('GameLeavingService', ['leaveGame']);

        mockDialogModalService = jasmine.createSpyObj('DialogmodalService', ['openModal', 'closeModals']);

        await TestBed.configureTestingModule({
            declarations: [GameParentPageComponent, MockOrganizerGameViewComponent, MockPlayerGameViewComponent],
            providers: [
                { provide: GameStateService, useValue: mockGameStateService },
                { provide: GameLeavingService, useValue: mockLeavingGameService },
                { provide: DialogModalService, useValue: mockDialogModalService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameParentPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set reloadComponent to true and then false after a timeout', fakeAsync(() => {
        component.reload();
        expect(component.reloadComponent).toBeTrue();

        tick(ONE_SECOND);
        expect(component.reloadComponent).toBeFalse();
    }));

    describe('onStateChanges', () => {
        it('should open intermission modal if new state is Intermission', () => {
            component['onStateChange'](UserGameState.Intermission);

            expect(mockDialogModalService.openModal).toHaveBeenCalledWith(IntermissionComponent);
        });

        it('should open intermission modal if new state is Intermission', () => {
            component['onStateChange'](UserGameState.Loading);

            expect(mockDialogModalService.openModal).toHaveBeenCalledWith(LoadingComponent);
        });

        it('should open organizerCorrection modal if new state is correction and user is organizer', () => {
            component['isOrganiser'] = true;
            component['onStateChange'](UserGameState.Correction);

            expect(mockDialogModalService.openModal).toHaveBeenCalledWith(OrganizerCorrectionComponent);
        });

        it('should open playerCorrection modal if new state is correction and user is not organizer', () => {
            component['isOrganiser'] = false;
            component['onStateChange'](UserGameState.Correction);

            expect(mockDialogModalService.openModal).toHaveBeenCalledWith(PlayerCorrectionComponent);
        });

        it('should call reload if user state changes', () => {
            component.userState = UserGameState.InGame;
            spyOn(component, 'reload');

            component['onStateChange'](UserGameState.InGame);

            expect(component.reload).toHaveBeenCalled();
        });
    });
});
