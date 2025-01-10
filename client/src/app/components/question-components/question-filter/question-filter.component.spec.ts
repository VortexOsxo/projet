import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionFilterComponent } from './question-filter.component';
import { QuestionService } from '@app/services/question-services/question.service';
import { QuestionType } from '@common/enums/question-type';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

describe('QuestionFilterComponent', () => {
    let component: QuestionFilterComponent;
    let fixture: ComponentFixture<QuestionFilterComponent>;
    let questionServiceSpy: jasmine.SpyObj<QuestionService>;

    beforeEach(async () => {
        const questionServiceSpyObj = jasmine.createSpyObj('QuestionService', ['addFilterByQuestionType', 'removeFilter']);

        await TestBed.configureTestingModule({
            declarations: [QuestionFilterComponent],
            providers: [{ provide: QuestionService, useValue: questionServiceSpyObj }],
            imports: [MatCardModule, MatButtonModule],
        }).compileComponents();

        questionServiceSpy = TestBed.inject(QuestionService) as jasmine.SpyObj<QuestionService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set selectedFilter to QCM when filterQuestionByQCM is called', () => {
        component.filterQuestionByQCM();
        expect(component['selectedFilter']).toBe(QuestionType.QCM);
    });

    it('should set selectedFilter to QRL when filterQuestionByQRL is called', () => {
        component.filterQuestionByQRL();
        expect(component['selectedFilter']).toBe(QuestionType.QRL);
    });

    it('should set selectedFilter to Undefined when removeFilter is called', () => {
        component.removeFilter();
        expect(component['selectedFilter']).toBe(QuestionType.Undefined);
    });

    it('should call questionService.addFilterByQuestionType(QCM) when filterQuestionByQCM is called', () => {
        component.filterQuestionByQCM();
        expect(questionServiceSpy.addFilterByQuestionType).toHaveBeenCalledWith(QuestionType.QCM);
    });

    it('should call questionService.addFilterByQuestionType(QRL) when filterQuestionByQRL is called', () => {
        component.filterQuestionByQRL();
        expect(questionServiceSpy.addFilterByQuestionType).toHaveBeenCalledWith(QuestionType.QRL);
    });

    it('should call questionService.removeFilter when removeFilter is called', () => {
        component.removeFilter();
        expect(questionServiceSpy.removeFilter).toHaveBeenCalled();
    });
});
