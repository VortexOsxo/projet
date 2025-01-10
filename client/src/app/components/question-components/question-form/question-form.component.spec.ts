import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { QuestionFormComponent } from './question-form.component';
import { LogoTitleComponent } from '@app/components/logo-title/logo-title.component';

describe('QuestionFormComponent', () => {
    let component: QuestionFormComponent;
    let fixture: ComponentFixture<QuestionFormComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionFormComponent, LogoTitleComponent],
            imports: [HttpClientTestingModule, MatDialogModule],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(QuestionFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
