import { Component, Input } from '@angular/core';
import { Quiz } from '@common/interfaces/quiz';

@Component({
    selector: 'app-quiz-details',
    templateUrl: './quiz-details.component.html',
    styleUrls: ['./quiz-details.component.scss'],
})
export class QuizDetailsComponent {
    @Input()
    quiz: Quiz;
}
