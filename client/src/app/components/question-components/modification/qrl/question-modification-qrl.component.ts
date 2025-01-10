import { Component, Input, OnInit } from '@angular/core';
import { Question } from '@common/interfaces/question';
import { QuestionModificationBase } from '@app/components/question-components/modification/base/question-modification-base';

@Component({
    selector: 'app-question-modification-qrl',
    templateUrl: './question-modification-qrl.component.html',
    styleUrls: ['./question-modification-qrl.component.scss'],
})
export class QuestionModificationQrlComponent extends QuestionModificationBase implements OnInit {
    @Input() question: Question;

    ngOnInit(): void {
        this.question ??= this.questionService.createVoidQCMQuestion();
    }
}
