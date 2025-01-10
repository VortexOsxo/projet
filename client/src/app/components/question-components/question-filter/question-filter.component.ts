import { Component, OnDestroy } from '@angular/core';
import { QuestionService } from '@app/services/question-services/question.service';
import { QuestionType } from '@common/enums/question-type';

@Component({
    selector: 'app-question-filter',
    templateUrl: './question-filter.component.html',
    styleUrls: ['./question-filter.component.scss'],
})
export class QuestionFilterComponent implements OnDestroy {
    private selectedFilter: string = QuestionType.Undefined;

    constructor(private questionService: QuestionService) {}

    isSelected(buttonName: string) {
        return buttonName === this.selectedFilter;
    }

    filterQuestionByQCM() {
        this.selectedFilter = QuestionType.QCM;
        this.questionService.addFilterByQuestionType(QuestionType.QCM);
    }

    filterQuestionByQRL() {
        this.selectedFilter = QuestionType.QRL;
        this.questionService.addFilterByQuestionType(QuestionType.QRL);
    }

    removeFilter() {
        this.selectedFilter = QuestionType.Undefined;
        this.questionService.removeFilter();
    }

    ngOnDestroy() {
        this.questionService.removeFilter();
    }
}
