import { Service } from 'typedi';
import { TimerService } from '@app/services/timer.service';
import { BaseGameObserver } from './base-observer';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Player } from '@app/interfaces/users/player';
import { INFINITE_TIME } from '@app/consts/timer.consts';
import { AnswerStats } from '@common/interfaces/answers/answer-stats';
import { TIME_ACTIVE } from '@app/consts/game.const';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';
import { GameChartSocketEvent } from '@common/enums/socket-event/game-charts-socket-event';

@Service({ transient: true })
export class ActivePlayerService extends BaseGameObserver {
    private playersLastModification: Map<Player, number>;
    private lastSentAnswer: AnswerStats;

    constructor(
        game: GameSessionBase,
        private timerService: TimerService,
    ) {
        super(game);
    }

    onPlayerActivity(player: Player) {
        this.playersLastModification.set(player, TIME_ACTIVE);
        this.sendDataToOrganizerIfNeeded();
    }

    initialize() {
        this.playersLastModification = new Map();

        this.timerService.setOnTickCallBack(this.onSecondPassed.bind(this)).startTimer(INFINITE_TIME);
        this.sendDataToOrganizerIfNeeded();

        this.users.forEach((user) => user.emitToUser(GameChartSocketEvent.SetQrlChartsGame));
    }

    clear() {
        this.timerService.stopTimer();
    }

    protected setUpGameObserver(game: GameSessionBase): void {
        game.removedUserSubject.subscribe(() => this.sendDataToOrganizerIfNeeded());
        game.removedGameSubject.subscribe(() => this.clear());
    }

    private onSecondPassed() {
        this.decrementTime();
        this.removeInactivePlayers();
        this.sendDataToOrganizerIfNeeded();
    }

    private sendDataToOrganizerIfNeeded() {
        const answerStats: AnswerStats = {
            questionIndex: this.question.index,
            barCounts: [this.getActivePlayersCount(), this.getInactivePlayersCount()],
        };
        if (!this.shouldSendAgain(answerStats)) return;

        this.organizer?.emitToUser(GameAnswerSocketEvent.SendAnswerStats, answerStats);
    }

    private decrementTime() {
        this.playersLastModification.forEach((timeLeft, player) => this.playersLastModification.set(player, timeLeft - 1));
    }

    private shouldSendAgain(newAnswer: AnswerStats) {
        if (this.lastSentAnswer) return this.wasAnswerModified(newAnswer);

        this.lastSentAnswer = newAnswer;
        return true;
    }

    private wasAnswerModified(answer: AnswerStats) {
        const hasIndexChanged = answer.questionIndex !== this.lastSentAnswer.questionIndex;
        const havePlayerActiveCountsChanged = answer.barCounts[0] !== this.lastSentAnswer.barCounts[0];
        const havePlayerInactiveCountsChanged = answer.barCounts[1] !== this.lastSentAnswer.barCounts[1];

        this.lastSentAnswer = answer;
        return hasIndexChanged || havePlayerActiveCountsChanged || havePlayerInactiveCountsChanged;
    }

    private removeInactivePlayers() {
        this.playersLastModification.forEach((timeLeft, player) => {
            if (timeLeft <= 0) this.playersLastModification.delete(player);
        });
    }

    private getInactivePlayersCount() {
        return this.getPlayersCount() - this.getActivePlayersCount();
    }

    private getActivePlayersCount() {
        return this.playersLastModification?.size || 0;
    }

    private getPlayersCount() {
        return this.players.length;
    }
}
