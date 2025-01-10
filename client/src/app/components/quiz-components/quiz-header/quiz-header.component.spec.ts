import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizHeaderComponent } from './quiz-header.component';
import { Quiz } from '@common/interfaces/quiz';

describe('QuizHeaderComponent', () => {
    let component: QuizHeaderComponent;
    let fixture: ComponentFixture<QuizHeaderComponent>;
    const testQuiz: Quiz = {
        id: '0',
        title: 'Quizz1',
        description: 'Un Quizz Sympa!',
        questions: [],
        duration: 30,
        lastModification: new Date(),
        isVisible: true,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuizHeaderComponent],
        });
        fixture = TestBed.createComponent(QuizHeaderComponent);
        component = fixture.componentInstance;
        component.quiz = testQuiz;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
