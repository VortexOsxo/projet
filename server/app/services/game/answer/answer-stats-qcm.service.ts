import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Player } from '@app/interfaces/users/player';
import { User } from '@app/interfaces/users/user';
import { Service } from 'typedi';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';
import { translatePlayers } from '@app/utils/translate.utils';
import { AnswerStats } from '@common/interfaces/answers/answer-stats';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

@Service({ transient: true })
export class AnswerStatsQCMService {
    private choicesStats: Map<number, number[]>;

    constructor(private game: GameSessionBase) {
        this.choicesStats = new Map();
    }

    updateChoiceStats(playersSelection: Map<Player, number[]>, questionIndex: number) {
        const currentChoices = this.getCurrentChoices(playersSelection);
        this.choicesStats.set(questionIndex, currentChoices);
        this.sendUpdatedStatsToOrganizer(currentChoices, questionIndex);
    }

    sendStatsToPlayers() {
        this.game.players.forEach((player) => {
            this.choicesStats.forEach((barCounts, questionIndex) => this.sendAnswerStats(player, { barCounts, questionIndex }));
            player.emitToUser(GamePlayerSocketEvent.SendPlayerStats, translatePlayers(this.game.players));
        });
    }

    private getCurrentChoices(playersSelection: Map<Player, number[]>): number[] {
        const currentChoices = [0, 0, 0, 0];
        playersSelection.forEach((selection) => {
            selection.forEach((choiceIndex) => {
                ++currentChoices[choiceIndex];
            });
        });
        return currentChoices;
    }

    private sendUpdatedStatsToOrganizer(choiceCounts: number[], questionIndex: number) {
        const answerStats: AnswerStats = {
            questionIndex,
            barCounts: choiceCounts,
        };
        this.sendAnswerStats(this.game.organizer, answerStats);
    }

    private sendAnswerStats(user: User, answerStats: AnswerStats) {
        user?.emitToUser(GameAnswerSocketEvent.SendAnswerStats, answerStats);
    }
}
