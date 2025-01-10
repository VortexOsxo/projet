import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionBankComponent } from './question-bank.component';
import { QuestionsComponent } from '@app/components/question-components/questions/questions.component';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { LogoTitleComponent } from '@app/components/logo-title/logo-title.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';

@Component({
    selector: 'app-question-filter',
    template: '',
})
export class MockQuestionFilterComponent {}

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionBankComponent, QuestionsComponent, LogoTitleComponent, MockQuestionFilterComponent],
            imports: [HttpClientModule, MatDialogModule, MatCardModule, MatButtonModule],
        });
        fixture = TestBed.createComponent(QuestionBankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
