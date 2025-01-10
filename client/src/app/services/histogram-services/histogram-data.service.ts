import { EventEmitter, Injectable } from '@angular/core';
import { GameListenerService } from '@app/services/game-services/base-classes/game-listener.service';
import { GameChartSocketEvent } from '@common/enums/socket-event/game-charts-socket-event';
import { SocketFactoryService } from '@app/services/socket-service/socket-factory.service';
import { GameInfoService } from '@app/services/game-services/game-info.service';
import { QRL_COLORS, QRL_ORGANIZER_LABELS, QRL_LEADERBOARD_LABELS, RIGHT_ANSWER_COLOR, WRONG_ANSWER_COLOR } from '@app/consts/histogram.const';
import { AnswerStats } from '@common/interfaces/answers/answer-stats';
import { QuestionType } from '@common/enums/question-type';
import { GameAnswerSocketEvent } from '@common/enums/socket-event/game-answer-socket-event';

@Injectable({
    providedIn: 'root',
})
export class HistogramDataService extends GameListenerService {
    answerEmitter: EventEmitter<number> = new EventEmitter();

    private qrmLabels = QRL_ORGANIZER_LABELS;
    private questionIndex: number;

    private submitedAnswers: Map<number, number[]>;

    constructor(
        socketFactory: SocketFactoryService,
        private gameInfoService: GameInfoService,
    ) {
        super(socketFactory);
    }

    private get question() {
        const quiz = this.gameInfoService.getQuiz();
        return quiz.questions[this.questionIndex];
    }

    setQuestionIndex(questionIndex: number) {
        this.questionIndex = questionIndex;
    }

    getCurrentAsnwers() {
        const answersFromMap = this.submitedAnswers.get(this.questionIndex);
        return answersFromMap ? answersFromMap : [];
    }

    getLabels() {
        return this.question.type === QuestionType.QCM ? this.getQCMBarLabels() : this.qrmLabels;
    }

    getBarColor() {
        return this.isQuestionAQCM() ? this.getQCMBarColor() : QRL_COLORS;
    }

    protected initializeState(): void {
        this.submitedAnswers = new Map();
        this.questionIndex = 0;
    }

    protected setUpSocket() {
        this.socketService.on(GameAnswerSocketEvent.SendAnswerStats, (answer: AnswerStats) => this.addAnswerToMap(answer));

        this.socketService.on(GameChartSocketEvent.SetQrlChartsGame, () => (this.qrmLabels = QRL_ORGANIZER_LABELS));
        this.socketService.on(GameChartSocketEvent.SetQrlChartsLeaderboard, () => (this.qrmLabels = QRL_LEADERBOARD_LABELS));
    }

    private isQuestionAQCM(): boolean {
        return this.question.type === QuestionType.QCM;
    }

    private getQCMBarLabels() {
        return this.question.choices.map((choice) => choice.text);
    }

    private getQCMBarColor() {
        return this.question.choices.map((choice) => (choice.isCorrect ? RIGHT_ANSWER_COLOR : WRONG_ANSWER_COLOR));
    }

    private addAnswerToMap(answer: AnswerStats): void {
        const answerIndex = answer.questionIndex;
        if (!answerIndex && answerIndex !== 0) return;

        this.updateAnswers(answer, answerIndex);
        this.answerEmitter.emit(answerIndex);
    }

    private updateAnswers(newAnswer: AnswerStats, answerIndex: number) {
        this.submitedAnswers.set(answerIndex, newAnswer.barCounts);
    }
}
