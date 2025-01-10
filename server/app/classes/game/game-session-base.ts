import { UserGameState } from '@common/enums/user-game-state';
import { ANSWER_TIME_QRL, GAME_INTERMISSION_TIME, GAME_LOADING_SCREEN_TIME } from '@app/consts/game.const';
import { GameConfig } from '@app/interfaces/game-config';
import { GameQuizHandlerService } from '@app/services/game/game-quiz-handler.service';
import { TimerService } from '@app/services/timer.service';
import { Subject } from 'rxjs';
import { Question } from '@common/interfaces/question';
import { GameBase } from './game-base';
import { GamePlaySocketEvent } from '@common/enums/socket-event/game-play-socket-event';
import { QuestionWithIndex } from '@app/interfaces/question-with-index';
import { QuestionType } from '@common/enums/question-type';

export class GameSessionBase extends GameBase {
    questionEndedSubject: Subject<Question>;
    questionStartedSubject: Subject<Question>;
    quizEndedSubject: Subject<void>;
    quizStartedSubject: Subject<void>;
    playersModifiedSubject: Subject<void>;

    private hasAllPlayersSubmited = false;

    constructor(
        protected timerService: TimerService,
        protected quizHandler: GameQuizHandlerService,
        gameConfig: GameConfig,
    ) {
        super(gameConfig);
        this.questionEndedSubject = new Subject();
        this.quizEndedSubject = new Subject();
        this.quizStartedSubject = new Subject();
        this.questionStartedSubject = new Subject();
        this.playersModifiedSubject = new Subject();
    }

    getQuestion(): QuestionWithIndex {
        return this.quizHandler.getQuestion();
    }

    getTimer() {
        return this.timerService;
    }

    setUp(): void {
        this.quizStartedSubject.next();
        this.timerService.setOnTickCallBack(this.sendTimerTickValue.bind(this));
    }

    continueQuiz() {
        this.quizHandler.goToNextQuestion();
        if (!this.quizHandler.isQuizFinished()) this.nextQuestionTransition();
        else this.onFinishedAllQuestions();
    }

    allPlayerHaveSubmited() {
        this.hasAllPlayersSubmited = true;
    }

    correctionWasFinished() {
        this.updateUsersState(UserGameState.InGame);
    }

    protected showLoading() {
        this.updateUsersState(UserGameState.Loading);
        this.setLoadingTimer();
    }

    protected showIntermission() {
        this.updateUsersState(UserGameState.Intermission);
        this.setIntermissionTimer();
    }

    protected showNextQuestion() {
        this.hasAllPlayersSubmited = false;
        this.questionStartedSubject.next(this.getQuestion());
        this.setQuestionAnsweringTimer();
        this.updateUsersState(UserGameState.InGame);
    }

    protected shouldGoToCorrectionState() {
        return this.getQuestion().type === QuestionType.QRL;
    }

    protected questionTimerExpired() {
        this.timerService.resetStopCondition();
        if (this.shouldGoToCorrectionState()) this.updateUsersState(UserGameState.Correction);
        this.questionEndedSubject.next(this.getQuestion());
    }

    protected nextQuestionTransition() {
        this.timerService.setOnTimerEndedCallback(() => this.showNextQuestion()).startTimer(GAME_INTERMISSION_TIME);
    }

    protected onFinishedAllQuestions() {
        this.timerService.setOnTimerEndedCallback(() => this.onFinishedGame()).startTimer(GAME_INTERMISSION_TIME);
    }

    protected onFinishedGame() {
        this.quizEndedSubject.next();
        this.updateUsersState(UserGameState.Leaderboard);
        this.clearGame();
    }

    protected clearGame(): void {
        super.clearGame();
        this.timerService.stopTimer();
    }

    private setLoadingTimer() {
        this.timerService.setOnTimerEndedCallback(this.showNextQuestion.bind(this)).startTimer(GAME_LOADING_SCREEN_TIME);
    }

    private setIntermissionTimer() {
        this.timerService.setOnTimerEndedCallback(this.showNextQuestion.bind(this)).startTimer(GAME_INTERMISSION_TIME);
    }

    private setQuestionAnsweringTimer() {
        this.timerService
            .setOnTimerEndedCallback(this.questionTimerExpired.bind(this))
            .setStopCondition(this.stopTimerCondition.bind(this))
            .startTimer(this.getTimerDuration());
    }

    private getTimerDuration() {
        return this.getQuestion().type === QuestionType.QCM ? this.quiz.duration : ANSWER_TIME_QRL;
    }

    private sendTimerTickValue(tickValue: number) {
        this.users.forEach((user) => {
            user.emitToUser(GamePlaySocketEvent.TimerTicked, tickValue);
        });
    }

    private stopTimerCondition() {
        return this.hasAllPlayersSubmited;
    }
}
