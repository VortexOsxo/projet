import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableDataSourcePaginator } from '@angular/material/table';
import { GAME_HISTORY_TABLE_COLUMNS } from '@app/consts/game-history.const';
import { GameHistoryService } from '@app/services/game-services/game-history.service';
import { GameHistory } from '@common/interfaces/game-history';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-history-page',
    templateUrl: './game-history-page.component.html',
    styleUrls: ['./game-history-page.component.scss'],
})
export class GameHistoryPageComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns: string[] = GAME_HISTORY_TABLE_COLUMNS;

    tableData: MatTableDataSource<GameHistory, MatTableDataSourcePaginator>;

    private gameSubscription: Subscription = new Subscription();

    constructor(private readonly gameHistoryService: GameHistoryService) {}

    ngOnInit(): void {
        this.tableData = new MatTableDataSource([] as GameHistory[]);

        this.gameSubscription = this.gameHistoryService.getGameObservable().subscribe(this.updateGames.bind(this));
    }

    ngOnDestroy(): void {
        this.gameSubscription.unsubscribe();
    }

    ngAfterViewInit() {
        this.tableData.sort = this.sort;
    }

    updateGames(gameHistories: GameHistory[]): void {
        this.tableData.data = gameHistories;
    }

    deleteGames(): void {
        this.gameHistoryService.deleteGames();
    }
}
