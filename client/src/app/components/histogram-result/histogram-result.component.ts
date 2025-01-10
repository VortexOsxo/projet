import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Question } from '@common/interfaces/question';
import { HistogramBuilderService } from '@app/services/histogram-services/histogram-builder.service';
import { HistogramDataService } from '@app/services/histogram-services/histogram-data.service';
import Chart from 'chart.js/auto';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-histogram-result',
    template: '<canvas #chart></canvas>',
    styleUrls: ['./histogram-result.component.scss'],
})
export class HistogramResultComponent implements OnChanges, OnDestroy, AfterViewInit {
    @Input() questionHistogram: Question;
    @Input() questionIndex: number = 0;
    @ViewChild('chart') chartElement!: ElementRef<HTMLCanvasElement>;

    chart!: Chart;

    private answerSubscription: Subscription;

    constructor(
        private histogramDataService: HistogramDataService,
        private histogramBuilderService: HistogramBuilderService,
    ) {}

    ngAfterViewInit(): void {
        this.answerSubscription = this.histogramDataService.answerEmitter.subscribe((modifiedIndex) => {
            if (modifiedIndex === this.questionIndex) this.updateChart();
        });
        this.updateChart();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.shouldUpdateChart(changes)) return;
        if (!this.questionHistogram || !this.chartElement) return;
        this.updateChart();
    }

    ngOnDestroy(): void {
        this.answerSubscription.unsubscribe();
        this.chart?.destroy();
    }

    private shouldUpdateChart(changes: SimpleChanges): boolean {
        // The double negation are here to transform to a boolean
        return !!changes['questionHistogram'] || !!changes['questionIndex'] || !!changes['showData'];
    }

    private updateChart(): void {
        this.chart?.destroy();

        const chartConfig = this.histogramBuilderService.createChartConfig(this.questionHistogram, this.questionIndex);
        this.chart = new Chart(this.chartElement.nativeElement, chartConfig);
    }
}
