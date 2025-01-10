import { Component, Input } from '@angular/core';
import { Quiz } from '@common/interfaces/quiz';

@Component({
    selector: 'app-quiz-header',
    templateUrl: './quiz-header.component.html',
    styleUrls: ['./quiz-header.component.scss'],
})
export class QuizHeaderComponent {
    @Input()
    quiz: Quiz;
}
