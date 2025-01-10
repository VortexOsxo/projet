import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCountdownComponent } from './game-countdown.component';

describe('GameCountdownComponent', () => {
    let component: GameCountdownComponent;
    let fixture: ComponentFixture<GameCountdownComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameCountdownComponent],
        });
        fixture = TestBed.createComponent(GameCountdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
