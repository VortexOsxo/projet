import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingComponent } from './loading.component';
import { MatCardModule } from '@angular/material/card';
import { GameInfoService } from '@app/services/game-services/game-info.service';
import { Quiz } from '@common/interfaces/quiz';
import { GameCountdownComponent } from '@app/components/game-countdown/game-countdown.component';

describe('LoadingComponent', () => {
    let component: LoadingComponent;
    let fixture: ComponentFixture<LoadingComponent>;
    let gameInfoServiceMock: jasmine.SpyObj<GameInfoService>;

    beforeEach(() => {
        gameInfoServiceMock = jasmine.createSpyObj('GameInfoService', ['getQuiz']);

        TestBed.configureTestingModule({
            declarations: [LoadingComponent, GameCountdownComponent],
            providers: [{ provide: GameInfoService, useValue: gameInfoServiceMock }],
            imports: [MatCardModule],
        });

        fixture = TestBed.createComponent(LoadingComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('quizTitle', () => {
        it('should get the quiz title from the gameinfo component', () => {
            const mockQuiz: Quiz = { title: 'fakeTitle' } as Quiz;
            gameInfoServiceMock.getQuiz.and.returnValue(mockQuiz);

            fixture.detectChanges();

            expect(component.quizTitle).toEqual(mockQuiz.title);
            expect(gameInfoServiceMock.getQuiz).toHaveBeenCalled();
        });
    });
});
