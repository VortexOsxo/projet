import { Player } from '@app/interfaces/users/player';
import { GameSessionMultiplayer } from './game-session-multiplayer';
import { KickedOutMessage } from '@app/enums/kicked-out-message';

export class GameSessionNormal extends GameSessionMultiplayer {
    private canGoToNextQuestion: boolean = false;

    continueQuiz() {
        if (!this.canGoToNextQuestion) return;
        super.continueQuiz();
    }

    removePlayer(playerToRemove: Player, reason?: string): boolean {
        if (!super.removePlayer(playerToRemove, reason)) return false;

        if (this.areTherePlayerLeft()) return true;

        this.removeOrganizerIntern(KickedOutMessage.NoPlayerLeft);
        this.clearGame();
        return true;
    }

    correctionWasFinished(): void {
        super.correctionWasFinished();
        this.canGoToNextQuestion = true;
    }

    protected nextQuestionTransition() {
        this.showIntermission();
    }

    protected showNextQuestion() {
        this.canGoToNextQuestion = false;
        super.showNextQuestion();
    }

    protected onFinishedAllQuestions(): void {
        super.onFinishedGame();
    }
}
