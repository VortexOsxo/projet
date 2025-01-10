import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomQuizHeaderComponent } from './random-quiz-header.component';

describe('RandomQuizHeaderComponent', () => {
    let component: RandomQuizHeaderComponent;
    let fixture: ComponentFixture<RandomQuizHeaderComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RandomQuizHeaderComponent],
        });
        fixture = TestBed.createComponent(RandomQuizHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
