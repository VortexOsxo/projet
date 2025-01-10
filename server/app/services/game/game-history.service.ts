import { Service } from 'typedi';
import { DataManagerService } from '@app/services/data/data-manager.service';
import { GameHistory } from '@common/interfaces/game-history';
import { GameBase } from '@app/classes/game/game-base';
import { HISTORY_COLLECTION } from '@app/consts/database.consts';
import { GameHistorySocket } from '@app/services/sockets/game-history-socket.service';

@Service()
export class GameHistoryService {
    private registeredGames: Map<number, GameHistory>;

    constructor(
        private dataManagerService: DataManagerService<GameHistory>,
        private gameHistorySocket: GameHistorySocket,
    ) {
        this.dataManagerService.setCollection(HISTORY_COLLECTION);
        this.registeredGames = new Map();
    }

    registerToHistory(gameToRegister: GameBase) {
        const playersNb = this.findPlayersNb(gameToRegister);
        const gameName = this.findName(gameToRegister);

        const gameHistory = this.createNewGameHistory(gameName, playersNb);

        const gameId = this.findId(gameToRegister);
        this.registeredGames.set(gameId, gameHistory);
    }

    unregisterFromHistory(gameToUnregister: GameBase) {
        const gameId = this.findId(gameToUnregister);
        this.registeredGames.delete(gameId);
    }

    async saveGameToHistory(gameToSave: GameBase) {
        const gameHistory = this.getGameHistory(gameToSave);
        if (!gameHistory) return;

        gameHistory.bestScore = this.findBestScore(gameToSave);

        await this.dataManagerService.addElement(gameHistory);
        this.unregisterFromHistory(gameToSave);

        this.gameHistorySocket.emitGameHistoryChangedNotification();
    }

    async getHistory() {
        return this.dataManagerService.getElements();
    }

    async deleteHistory() {
        await this.dataManagerService.deleteAllElements();
        this.gameHistorySocket.emitGameHistoryChangedNotification();
    }

    private createNewGameHistory(gameName: string, playersNb: number): GameHistory {
        return {
            id: '0',
            startDate: new Date(),
            playersNb,
            gameName,
            bestScore: 0,
        };
    }

    private findName(game: GameBase): string {
        return game.quiz.title;
    }

    private findPlayersNb(game: GameBase): number {
        return game.players.length;
    }

    private findBestScore(game: GameBase): number {
        const playersScore = game.players.map((player) => (player.score ? player.score : 0));

        if (!playersScore.length) return 0;

        return playersScore.reduce((bestScore, current) => {
            return current > bestScore ? current : bestScore;
        }, playersScore[0]);
    }

    private findId(game: GameBase): number {
        return game.gameId;
    }

    private getGameHistory(game: GameBase) {
        const gameId = game.gameId;
        return this.registeredGames.get(gameId);
    }
}
