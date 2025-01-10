import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerCorrectionComponent } from './player-correction.component';
import { MatCardModule } from '@angular/material/card';

describe('PlayerCorrectionComponent', () => {
    let component: PlayerCorrectionComponent;
    let fixture: ComponentFixture<PlayerCorrectionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerCorrectionComponent],
            imports: [MatCardModule],
        });
        fixture = TestBed.createComponent(PlayerCorrectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
