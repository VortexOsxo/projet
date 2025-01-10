import { Service } from 'typedi';
import { AnswerManagerBase } from './answer-manager-base.service';
import { GameSessionBase } from '@app/classes/game/game-session-base';
import { Player } from '@app/interfaces/users/player';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

@Service({ transient: true })
export class AnswerManagerQRLTest extends AnswerManagerBase {
    // This constructor is need to properly instanciate the game attribute
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(game: GameSessionBase) {
        super(game);
    }

    protected setUpPlayerSocket(): void {
        // As this is a test game, the player answer has no influence on its grade so we do not need to collect them
    }

    protected clearPlayerSocket(): void {
        // As this is a test game, we have no socket event to clear
    }

    protected setUpGameObserver(): void {
        // no need for game observer either
    }

    protected resetAnswer(): void {
        // There is nothing to reset
    }

    protected finalizeAnswerSubmissionsIntern(): void {
        this.players[0].score += this.question.points;
        this.sendCorrectionMessage(this.players[0]);
        this.onCorrectionfinished();
    }

    private sendCorrectionMessage(player: Player) {
        player.emitToUser(GameAnswerSocketEvent.SendCorrectionMessage, `Vouz avez obtenue 100% soit ${this.question.points} points`);
    }
}
