import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntermissionComponent } from './intermission.component';
import { GameCountdownComponent } from '@app/components/game-countdown/game-countdown.component';
import { MatCardModule } from '@angular/material/card';

describe('IntermissionComponent', () => {
    let component: IntermissionComponent;
    let fixture: ComponentFixture<IntermissionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [IntermissionComponent, GameCountdownComponent],
            imports: [MatCardModule],
        });
        fixture = TestBed.createComponent(IntermissionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
