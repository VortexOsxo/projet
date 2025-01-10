import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Player } from '@common/interfaces/player';
import { GamePlayersStatService } from '@app/services/game-services/game-players-stat.service';
import { of } from 'rxjs';
import { PlayerListComponent } from './player-list.component';
import { PlayerResultComponent } from '@app/components/player-result/player-result.component';
import { PlayerState } from '@common/enums/user-answer-state';
import { PlayerSort } from '@app/enums/player-sort';

describe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    let gamePlayersStatServiceSpy: jasmine.SpyObj<GamePlayersStatService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('GamePlayersStatService', [
            'getPlayersObservable',
            'setSortPlayersByName',
            'setSortPlayersByScore',
            'setSortPlayersByState',
            'setReversedState',
            'getPlayers',
        ]);

        TestBed.configureTestingModule({
            declarations: [PlayerListComponent, PlayerResultComponent],
            providers: [{ provide: GamePlayersStatService, useValue: spy }],
        });
        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        gamePlayersStatServiceSpy = TestBed.inject(GamePlayersStatService) as jasmine.SpyObj<GamePlayersStatService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set sortAlgorithmName correctly when setter is called', () => {
        const sortAlgorithmName = PlayerSort.Alphabetical;
        component.sortAlgorithmName = sortAlgorithmName;
        expect(gamePlayersStatServiceSpy.sortAlgorithmName).toEqual(sortAlgorithmName);
    });

    it('should return correct sortAlgorithmName when getter is called', () => {
        const sortAlgorithmName = PlayerSort.Points;
        gamePlayersStatServiceSpy.sortAlgorithmName = sortAlgorithmName;
        expect(component.sortAlgorithmName).toEqual(sortAlgorithmName);
    });

    it('should subscribe to players observers on init and sort by score if hasAllFunctionalities', () => {
        const players: Player[] = [
            { name: 'Player 1', score: 100, bonusCount: 2, answerState: PlayerState.ANSWERING },
            { name: 'Player 2', score: 80, bonusCount: 1, answerState: PlayerState.NO_ANSWER },
        ];

        gamePlayersStatServiceSpy.getPlayersObservable.and.returnValue(of(players));
        gamePlayersStatServiceSpy.getPlayers.and.returnValue(players);
        component.ngOnInit();

        expect(component.players).toEqual(players);
        expect(gamePlayersStatServiceSpy.setReversedState).toHaveBeenCalledWith(false);
        expect(gamePlayersStatServiceSpy.setSortPlayersByScore).toHaveBeenCalled();
    });

    it('should call ngOnDestroy on component destroy', () => {
        const ngOnDestroySpy = spyOn(component, 'ngOnDestroy').and.callThrough();
        component.ngOnDestroy();
        expect(ngOnDestroySpy).toHaveBeenCalled();
    });

    it('should call setSortPlayersByName when sortMethod is Alphabetical', () => {
        const sortMethod = PlayerSort.Alphabetical;
        component['updateSort'](sortMethod);

        expect(gamePlayersStatServiceSpy.setSortPlayersByName).toHaveBeenCalled();
        expect(gamePlayersStatServiceSpy.setReversedState).toHaveBeenCalledWith(false);
    });

    it('should call setSortPlayersByName when sortMethod is ReverseAlphabetical', () => {
        const sortMethod = PlayerSort.ReverseAlphabetical;
        component['updateSort'](sortMethod);

        expect(gamePlayersStatServiceSpy.setSortPlayersByName).toHaveBeenCalled();
        expect(gamePlayersStatServiceSpy.setReversedState).toHaveBeenCalledWith(true);
    });

    it('should call setSortPlayersByScore when sortMethod is Points', () => {
        const sortMethod = PlayerSort.Points;
        component['updateSort'](sortMethod);

        expect(gamePlayersStatServiceSpy.setSortPlayersByScore).toHaveBeenCalled();
        expect(gamePlayersStatServiceSpy.setReversedState).toHaveBeenCalledWith(false);
    });

    it('should call setSortPlayersByScore when sortMethod is ReversePoints', () => {
        const sortMethod = PlayerSort.ReversePoints;
        component['updateSort'](sortMethod);

        expect(gamePlayersStatServiceSpy.setSortPlayersByScore).toHaveBeenCalled();
        expect(gamePlayersStatServiceSpy.setReversedState).toHaveBeenCalledWith(true);
    });

    it('should call setSortPlayersByState when sortMethod is Color', () => {
        const sortMethod = PlayerSort.Color;
        component['updateSort'](sortMethod);

        expect(gamePlayersStatServiceSpy.setSortPlayersByState).toHaveBeenCalled();
        expect(gamePlayersStatServiceSpy.setReversedState).toHaveBeenCalledWith(false);
    });

    it('should call setSortPlayersByState when sortMethod is ReverseColor', () => {
        const sortMethod = PlayerSort.ReverseColor;
        component['updateSort'](sortMethod);

        expect(gamePlayersStatServiceSpy.setSortPlayersByState).toHaveBeenCalled();
        expect(gamePlayersStatServiceSpy.setReversedState).toHaveBeenCalledWith(true);
    });

    it('should call updateSort and getPlayers on action', () => {
        const event = { target: { value: PlayerSort.Alphabetical } } as unknown as Event;
        const updateSortSpy = spyOn(component as unknown as { updateSort: (sortMethod: PlayerSort) => void }, 'updateSort').and.callThrough();

        component.action(event);

        expect(updateSortSpy).toHaveBeenCalledWith(PlayerSort.Alphabetical);
        expect(gamePlayersStatServiceSpy.getPlayers).toHaveBeenCalled();
    });
});
