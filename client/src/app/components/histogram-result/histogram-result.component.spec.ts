import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistogramBuilderService } from '@app/services/histogram-services/histogram-builder.service';
import { HistogramDataService } from '@app/services/histogram-services/histogram-data.service';

import { ElementRef, EventEmitter, SimpleChange, SimpleChanges } from '@angular/core';
import { QuestionType } from '@common/enums/question-type';
import { Question } from '@common/interfaces/question';
import { HistogramResultComponent } from './histogram-result.component';

const HISTOGRAM_PARAMS = {
    id: '',
    text: '',
    type: QuestionType.QCM,
    points: 0,
    lastModification: new Date(''),
    choices: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: true },
    ],
};

describe('HistogramResultComponent', () => {
    let component: HistogramResultComponent;
    let fixture: ComponentFixture<HistogramResultComponent>;
    let histogramDataServiceMock: jasmine.SpyObj<HistogramDataService>;
    let histogramBuilderServiceMock: jasmine.SpyObj<HistogramBuilderService>;

    let updateChartSpy: jasmine.Spy;

    beforeEach(() => {
        histogramDataServiceMock = jasmine.createSpyObj(HistogramDataService, ['getSpecificQuestionResults', 'getLabels', 'getBarColor']);
        histogramDataServiceMock.answerEmitter = new EventEmitter();
        histogramBuilderServiceMock = jasmine.createSpyObj(HistogramBuilderService, ['createChartConfig']);

        TestBed.configureTestingModule({
            declarations: [HistogramResultComponent],
            providers: [
                { provide: HistogramDataService, useValue: histogramDataServiceMock },
                { provide: HistogramBuilderService, useValue: histogramBuilderServiceMock },
            ],
        });
        fixture = TestBed.createComponent(HistogramResultComponent);
        component = fixture.componentInstance;

        updateChartSpy = spyOn(component as unknown as { updateChart: () => void }, 'updateChart').and.callThrough();

        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
        updateChartSpy.calls.reset();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update chart when view is initialized', () => {
        component.ngAfterViewInit();
        expect(updateChartSpy).toHaveBeenCalled();
    });

    it('should update chart when inputs change', () => {
        component.questionHistogram = HISTOGRAM_PARAMS;
        component.questionIndex = 1;
        component.ngOnChanges({ questionHistogram: {}, questionIndex: {} } as unknown as SimpleChanges);

        expect(updateChartSpy).toHaveBeenCalled();
    });

    it('should update chart when inputs is change', () => {
        component.questionHistogram = {} as Question;
        component.questionIndex = 1;

        component.questionHistogram = HISTOGRAM_PARAMS;

        component.ngOnChanges({ questionHistogram: {}, questionIndex: {} } as unknown as SimpleChanges);
        expect(updateChartSpy).toHaveBeenCalled();
    });

    it('should destroy subscription on ngOnDestroy', () => {
        const unsubscribeSpy = spyOn(component['answerSubscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should update chart when data service emits answer for same question index', () => {
        component.questionIndex = 1;

        histogramDataServiceMock.answerEmitter.next(1);
        expect(updateChartSpy).toHaveBeenCalled();
    });

    it('should return true if "questionHistogram" changes', () => {
        const changes: SimpleChanges = {
            questionHistogram: new SimpleChange(null, {}, false),
        };
        expect(component['shouldUpdateChart'](changes)).toBe(true);
    });

    it('should return false if no relevant properties change', () => {
        const changes: SimpleChanges = {};
        expect(component['shouldUpdateChart'](changes)).toBe(false);
    });

    it('should not update chart if shouldUpdateChart returns false', () => {
        updateChartSpy.calls.reset();
        const shouldUpdateChartSpy = spyOn(component as unknown as { shouldUpdateChart: () => boolean }, 'shouldUpdateChart').and.returnValue(false);

        component.ngOnChanges({} as SimpleChanges);

        expect(shouldUpdateChartSpy).toHaveBeenCalled();
        expect(updateChartSpy).not.toHaveBeenCalled();
    });

    it('should not update chart if questionHistogram is falsy', () => {
        updateChartSpy.calls.reset();
        const shouldUpdateChartSpy = spyOn(component as unknown as { shouldUpdateChart: () => boolean }, 'shouldUpdateChart').and.returnValue(true);

        component.chartElement = {} as ElementRef<HTMLCanvasElement>;

        component.ngOnChanges({} as SimpleChanges);

        expect(shouldUpdateChartSpy).toHaveBeenCalled();
        expect(updateChartSpy).not.toHaveBeenCalled();
    });

    it('should not update chart if chartElement is falsy', () => {
        updateChartSpy.calls.reset();
        const shouldUpdateChartSpy = spyOn(component as unknown as { shouldUpdateChart: () => boolean }, 'shouldUpdateChart').and.returnValue(true);

        component.questionHistogram = HISTOGRAM_PARAMS;
        component['chartElement'] = undefined as unknown as ElementRef<HTMLCanvasElement>;

        component.ngOnChanges({} as SimpleChanges);

        expect(shouldUpdateChartSpy).toHaveBeenCalled();
        expect(updateChartSpy).not.toHaveBeenCalled();
    });

    it('should update chart if all conditions pass', () => {
        component.questionHistogram = HISTOGRAM_PARAMS;
        component.chartElement = {} as ElementRef<HTMLCanvasElement>;

        component.ngOnChanges({} as SimpleChanges);

        expect(updateChartSpy).toHaveBeenCalled();
    });
});
