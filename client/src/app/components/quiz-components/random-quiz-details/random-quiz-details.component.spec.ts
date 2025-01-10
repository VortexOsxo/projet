import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomQuizDetailsComponent } from './random-quiz-details.component';

describe('RandomQuizDetailsComponent', () => {
    let component: RandomQuizDetailsComponent;
    let fixture: ComponentFixture<RandomQuizDetailsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RandomQuizDetailsComponent],
        });
        fixture = TestBed.createComponent(RandomQuizDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
