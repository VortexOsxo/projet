import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSort } from '@angular/material/sort';
import { GameHistory } from '@common/interfaces/game-history';
import { GameHistoryService } from '@app/services/game-services/game-history.service';
import { of } from 'rxjs';
import { GameHistoryPageComponent } from './game-history-page.component';
import { LogoTitleComponent } from '@app/components/logo-title/logo-title.component';

describe('GameHistoryPageComponent', () => {
    let component: GameHistoryPageComponent;
    let fixture: ComponentFixture<GameHistoryPageComponent>;
    let gameHistoryServiceSpy: jasmine.SpyObj<GameHistoryService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('GameHistoryService', ['getGameObservable', 'deleteGames']);
        TestBed.configureTestingModule({
            declarations: [GameHistoryPageComponent, LogoTitleComponent],
            providers: [{ provide: GameHistoryService, useValue: spy }],
        });
        fixture = TestBed.createComponent(GameHistoryPageComponent);
        component = fixture.componentInstance;
        gameHistoryServiceSpy = TestBed.inject(GameHistoryService) as jasmine.SpyObj<GameHistoryService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to game history updates', () => {
        const gameHistories: GameHistory[] = [
            {
                id: '1',
                gameName: 'Game 1',
                startDate: new Date(),
                playersNb: 5,
                bestScore: 100,
            },
            {
                id: '2',
                gameName: 'Game 2',
                startDate: new Date(),
                playersNb: 3,
                bestScore: 80,
            },
        ];
        gameHistoryServiceSpy.getGameObservable.and.returnValue(of(gameHistories));

        component.ngOnInit();

        expect(gameHistoryServiceSpy.getGameObservable).toHaveBeenCalled();
        expect(component.tableData.data).toEqual(gameHistories);
    });

    it('should set sort on ngAfterViewInit', () => {
        const mockSort = new MatSort();
        gameHistoryServiceSpy.getGameObservable.and.returnValue(of([]));
        component.ngOnInit();
        component.sort = mockSort;
        component.ngAfterViewInit();

        expect(component.tableData.sort).toBe(mockSort);
    });

    it('should call deleteGames on deleteGames', () => {
        component.deleteGames();
        expect(gameHistoryServiceSpy.deleteGames).toHaveBeenCalled();
    });
});
