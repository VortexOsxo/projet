import { GameSessionBase } from '@app/classes/game/game-session-base';
import { translatePlayers } from '@app/utils/translate.utils';
import { GamePlayerSocketEvent } from '@common/enums/socket-event/game-player-socket-event';
import { PlayerState } from '@common/enums/user-answer-state';
import { Service } from 'typedi';
import { BaseGameObserver } from './base-observer';

@Service({ transient: true })
export class PlayerStateManager extends BaseGameObserver {
    // This constructor is needed to properly use the dependency injection
    // to provide the proper GameSessionBase to the base constructor
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(game: GameSessionBase) {
        super(game);
    }

    protected setUpGameObserver(game: GameSessionBase): void {
        game.questionStartedSubject.subscribe(() => this.resetAnswerStates());

        game.playersModifiedSubject.subscribe(() => this.sendStateOrginazer());
    }

    private resetAnswerStates() {
        this.players.forEach((player) => (player.answerState = PlayerState.NO_ANSWER));
        this.sendStateOrginazer();
    }

    private sendStateOrginazer() {
        this.organizer.emitToUser(GamePlayerSocketEvent.SendPlayerStats, translatePlayers(this.game.players));
    }
}
