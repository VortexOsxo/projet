import { TestBed } from '@angular/core/testing';
import { HISTOGRAM_PLUGINS, HISTOGRAM_SCALES, RIGHT_ANSWER_COLOR } from '@app/consts/histogram.const';
import { Question } from '@common/interfaces/question';
import { ChartConfiguration } from 'chart.js/auto';
import { HistogramBuilderService } from './histogram-builder.service';
import { HistogramDataService } from './histogram-data.service';

describe('HistogramBuilderService', () => {
    let service: HistogramBuilderService;
    let histogramDataServiceSpy: jasmine.SpyObj<HistogramDataService>;

    beforeEach(() => {
        histogramDataServiceSpy = jasmine.createSpyObj(HistogramDataService, ['getCurrentAsnwers', 'getLabels', 'getBarColor', 'setQuestionIndex']);
        TestBed.configureTestingModule({
            providers: [HistogramBuilderService, { provide: HistogramDataService, useValue: histogramDataServiceSpy }],
        });

        service = TestBed.inject(HistogramBuilderService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create chart configuration', () => {
        const question: Question = {
            text: 'Sample Question',
        } as Question;

        const questionIndex = 0;
        const mockData = 5;
        const mockLabel = ['Choice1', 'Choice2'];
        const mockColors = [RIGHT_ANSWER_COLOR, RIGHT_ANSWER_COLOR];

        histogramDataServiceSpy.getCurrentAsnwers.and.returnValue([mockData]);
        histogramDataServiceSpy.getBarColor.and.returnValue(mockColors);
        histogramDataServiceSpy.getLabels.and.returnValue(mockLabel);

        const expectedChartConfig: ChartConfiguration<'bar', number[], unknown> = {
            type: 'bar',
            data: {
                labels: mockLabel,
                datasets: [
                    {
                        data: [mockData],
                        backgroundColor: mockColors,
                    },
                ],
            },
            options: {
                scales: HISTOGRAM_SCALES,
                plugins: HISTOGRAM_PLUGINS,
            },
        };

        const chartConfig = service.createChartConfig(question, questionIndex);

        expect(chartConfig).toEqual(expectedChartConfig);
    });
});
