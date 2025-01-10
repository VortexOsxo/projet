import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Quiz } from '@common/interfaces/quiz';
import { QuizDetailsComponent } from './quiz-details.component';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

describe('QuizzDetailsComponent', () => {
    let component: QuizDetailsComponent;
    let fixture: ComponentFixture<QuizDetailsComponent>;
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
            declarations: [QuizDetailsComponent],
            imports: [MatCardModule, MatListModule],
        });
        fixture = TestBed.createComponent(QuizDetailsComponent);
        component = fixture.componentInstance;
        component.quiz = testQuiz;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
