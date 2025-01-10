import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameInfoService } from '@app/services/game-services/game-info.service';

import { FormsModule } from '@angular/forms';
import { ChatComponent } from '@app/components/chat/chat.component';
import { LogoTitleComponent } from '@app/components/logo-title/logo-title.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { ResultsViewComponent } from './results-view.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Component, Input } from '@angular/core';
import { Question } from '@common/interfaces/question';

@Component({
    selector: 'app-histogram-result',
    template: '<div>{{ questionHistogram | json }}</div>',
})
export class MockHistogramResultComponent {
    @Input() questionHistogram: Question;
    @Input() questionIndex: number = 0;
}

describe('ResultsViewComponent', () => {
    let component: ResultsViewComponent;
    let fixture: ComponentFixture<ResultsViewComponent>;
    let gameInfoService: GameInfoService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ResultsViewComponent, LogoTitleComponent, MockHistogramResultComponent, PlayerListComponent, ChatComponent],
            providers: [GameInfoService],
            imports: [FormsModule, MatDialogModule, MatSnackBarModule],
        });
        fixture = TestBed.createComponent(ResultsViewComponent);
        component = fixture.componentInstance;
        gameInfoService = TestBed.inject(GameInfoService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not go to previous graph when index is 0', () => {
        component.questionGraphIndex = 0;
        component.goToPreviousGraph();
        expect(component.questionGraphIndex).toEqual(0);
    });

    it('should go to previous graph when index is greater than 0', () => {
        component.questionGraphIndex = 1;
        component.goToPreviousGraph();
        expect(component.questionGraphIndex).toEqual(0);
    });

    it('should not go to next graph when index is at last question', () => {
        component.questionGraphIndex = gameInfoService.getQuiz().questions.length - 1;
        component.goToNextGraph();
        expect(component.questionGraphIndex).toEqual(gameInfoService.getQuiz().questions.length - 1);
    });

    it('should go to next graph when index is not at last question', () => {
        component.questionGraphIndex = 0;
        spyOn(component, 'canGoToNextGraph').and.returnValue(true);
        component.goToNextGraph();
        expect(component.questionGraphIndex).toEqual(1);
    });
});
