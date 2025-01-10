import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { InitialViewPageComponent } from '@app/pages/initial-view-page/initial-view-page.component';
import { ChatComponent } from './components/chat/chat.component';
import { GameCountdownComponent } from './components/game-countdown/game-countdown.component';
import { HistogramResultComponent } from './components/histogram-result/histogram-result.component';
import { LocalQuestionBankComponent } from './components/local-question-bank/local-question-bank.component';
import { LogoTitleComponent } from './components/logo-title/logo-title.component';
import { AdminLoginInputModalComponent } from './components/modal/admin-login-input-modal/admin-login-input-modal.component';
import { ConfirmationModalComponent } from './components/modal/confirmation-modal/confirmation-modal.component';
import { GameIdInputModalComponent } from './components/modal/game-id-input-modal/game-id-input-modal.component';
import { GameUsernameInputModalComponent } from './components/modal/game-username-input-modal/game-username-input-modal.component';
import { ImportGameModalComponent } from './components/modal/import-game-modal/import-game-modal.component';
import { InformationModalComponent } from './components/modal/information-modal/information-modal.component';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { PlayerResultComponent } from './components/player-result/player-result.component';
import { QuestionFormComponent } from './components/question-components/question-form/question-form.component';
import { QuestionModificationQCMComponent } from './components/question-components/modification/qcm/question-modification-qcm.component';
import { QuestionsComponent } from './components/question-components/questions/questions.component';
import { QuizDetailsComponent } from './components/quiz-components/quiz-details/quiz-details.component';
import { QuizHeaderComponent } from './components/quiz-components/quiz-header/quiz-header.component';
import { AdminViewComponent } from './pages/admin-view/admin-view.component';
import { GameCreationPageComponent } from './pages/game-creation-page/game-creation-page.component';
import { GameParentPageComponent } from './pages/game-parent-page/game-parent-page.component';
import { LoadingComponent } from './components/loading/loading.component';
import { OrganiserGameViewComponent } from './pages/organiser-game-view/organiser-game-view.component';
import { PlayerGameViewComponent } from './pages/player-game-view/player-game-view.component';
import { QuestionBankComponent } from './pages/question-bank/question-bank.component';
import { QuizCreationPageComponent } from './pages/quiz-creation-page/quiz-creation-page.component';
import { ResultsViewComponent } from './pages/results-view/results-view.component';
import { WaitViewComponent } from './pages/wait-view/wait-view.component';
import { QuizService } from './services/quiz-services/quiz.service';
import { GameHistoryPageComponent } from './pages/game-history-page/game-history-page.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { QuestionModificationQrlComponent } from './components/question-components/modification/qrl/question-modification-qrl.component';
import { QuestionFilterComponent } from './components/question-components/question-filter/question-filter.component';
import { AnswerQcmComponent } from './components/answer/answer-qcm/answer-qcm.component';
import { AnswerQrlComponent } from './components/answer/answer-qrl/answer-qrl.component';
import { PlayerCorrectionComponent } from './components/correction/player-correction/player-correction.component';
import { OrganizerCorrectionComponent } from './components/correction/organizer-correction/organizer-correction.component';
import { IntermissionComponent } from './components/intermission/intermission.component';
import { RandomQuizDetailsComponent } from './components/quiz-components/random-quiz-details/random-quiz-details.component';
import { RandomQuizHeaderComponent } from './components/quiz-components/random-quiz-header/random-quiz-header.component';
import { InteractiveTimerComponent } from './components/interactive-timer/interactive-timer.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        PlayerGameViewComponent,
        InitialViewPageComponent,
        GameCreationPageComponent,
        QuizHeaderComponent,
        LogoTitleComponent,
        QuizDetailsComponent,
        InformationModalComponent,
        GameIdInputModalComponent,
        AdminLoginInputModalComponent,
        QuestionsComponent,
        QuestionBankComponent,
        QuestionFormComponent,
        QuizCreationPageComponent,
        QuestionModificationQCMComponent,
        AdminViewComponent,
        ImportGameModalComponent,
        LocalQuestionBankComponent,
        GameUsernameInputModalComponent,
        ResultsViewComponent,
        PlayerResultComponent,
        HistogramResultComponent,
        PlayerListComponent,
        ChatComponent,
        WaitViewComponent,
        ConfirmationModalComponent,
        OrganiserGameViewComponent,
        GameParentPageComponent,
        GameCountdownComponent,
        LoadingComponent,
        AnswerQcmComponent,
        AnswerQrlComponent,
        PlayerCorrectionComponent,
        OrganizerCorrectionComponent,
        IntermissionComponent,
        GameHistoryPageComponent,
        QuestionModificationQrlComponent,
        QuestionFilterComponent,
        RandomQuizDetailsComponent,
        RandomQuizHeaderComponent,
        InteractiveTimerComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatButtonModule,
        MatListModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatDialogModule,
        MatSnackBarModule,
        MatCardModule,
        MatTableModule,
        MatSortModule,
    ],
    providers: [QuizService],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
