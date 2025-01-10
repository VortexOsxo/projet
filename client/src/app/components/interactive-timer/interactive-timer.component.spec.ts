import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InteractiveTimerComponent } from './interactive-timer.component';
import { GameTimerControllerService } from '@app/services/game-services/game-timer-controller.service';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { GameCountdownComponent } from '@app/components/game-countdown/game-countdown.component';
import { PAUSE_ICON, RESUME_ICON } from '@app/consts/file-consts';

describe('InteractiveTimerComponent', () => {
    let component: InteractiveTimerComponent;
    let fixture: ComponentFixture<InteractiveTimerComponent>;
    let timerControllerServiceSpy: jasmine.SpyObj<GameTimerControllerService>;

    beforeEach(async () => {
        const timerControllerSpy = jasmine.createSpyObj('GameTimerControllerService', [
            'getCanStartPanicObserver',
            'getCanToggleStopObserver',
            'toggleStop',
            'togglePanic',
        ]);

        await TestBed.configureTestingModule({
            declarations: [InteractiveTimerComponent, GameCountdownComponent],
            providers: [{ provide: GameTimerControllerService, useValue: timerControllerSpy }],
            imports: [MatCardModule, FormsModule],
        }).compileComponents();

        timerControllerServiceSpy = TestBed.inject(GameTimerControllerService) as jasmine.SpyObj<GameTimerControllerService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InteractiveTimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call toggleStop method when toggleStop is called', () => {
        component.toggleStop();
        expect(timerControllerServiceSpy.toggleStop).toHaveBeenCalled();
        expect(component['iconPausePath']).toEqual(RESUME_ICON);

        component.toggleStop();
        expect(component['iconPausePath']).toEqual(PAUSE_ICON);
    });

    it('should call togglePanic method when startPanic is called', () => {
        component.startPanic();
        expect(timerControllerServiceSpy.togglePanic).toHaveBeenCalled();
    });
});
