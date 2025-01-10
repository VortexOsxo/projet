import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Question } from '@common/interfaces/question';

@Component({
    selector: 'app-question-form',
    templateUrl: './question-form.component.html',
    styleUrls: ['./question-form.component.scss'],
})
export class QuestionFormComponent {
    question: Question;
    constructor(@Inject(MAT_DIALOG_DATA) public data: Question) {
        if (data) this.question = JSON.parse(JSON.stringify(data));
    }
}
