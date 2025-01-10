import { Injectable } from '@angular/core';
import { HISTOGRAM_PLUGINS, HISTOGRAM_SCALES } from '@app/consts/histogram.const';
import { Question } from '@common/interfaces/question';
import { ChartConfiguration } from 'chart.js';
import { HistogramDataService } from './histogram-data.service';

@Injectable({
    providedIn: 'root',
})
export class HistogramBuilderService {
    constructor(private histogramDataService: HistogramDataService) {}

    createChartConfig(question: Question, questionIndex: number) {
        this.histogramDataService.setQuestionIndex(questionIndex);
        const chartConfig: ChartConfiguration = {
            type: 'bar',
            data: this.getData(),
            options: this.getOptions(question),
        };
        return chartConfig;
    }

    private getOptions(question: Question) {
        const plugins = HISTOGRAM_PLUGINS;
        plugins.title.text = question.text;

        return {
            scales: HISTOGRAM_SCALES,
            plugins,
        };
    }

    private getData() {
        const datas = this.histogramDataService.getCurrentAsnwers();

        return {
            labels: this.histogramDataService.getLabels(),
            datasets: [
                {
                    data: datas,
                    backgroundColor: this.histogramDataService.getBarColor(),
                },
            ],
        };
    }
}
