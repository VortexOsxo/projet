import { NgModule } from '@angular/core';
import { RouterModule, Routes, mapToCanActivate } from '@angular/router';
import { AdminViewComponent } from '@app/pages/admin-view/admin-view.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GameParentPageComponent } from '@app/pages/game-parent-page/game-parent-page.component';
import { InitialViewPageComponent } from '@app/pages/initial-view-page/initial-view-page.component';
import { QuestionBankComponent } from '@app/pages/question-bank/question-bank.component';
import { QuizCreationPageComponent } from '@app/pages/quiz-creation-page/quiz-creation-page.component';
import { AdminAuthGuardService } from '@app/services/auth-guards/admin-auth-guard.service';
import { GameHistoryPageComponent } from '@app/pages/game-history-page/game-history-page.component';
import { GameAuthGuardService } from '@app/services/auth-guards/game-auth-guard.service';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: InitialViewPageComponent },
    { path: 'game-creation', component: GameCreationPageComponent },
    { path: 'game-view', component: GameParentPageComponent, canActivate: mapToCanActivate([GameAuthGuardService]) },
    { path: 'bank', component: QuestionBankComponent, canActivate: mapToCanActivate([AdminAuthGuardService]) },
    { path: 'quiz-form', component: QuizCreationPageComponent, canActivate: mapToCanActivate([AdminAuthGuardService]) },
    { path: 'admin', component: AdminViewComponent, canActivate: mapToCanActivate([AdminAuthGuardService]) },
    { path: 'game-history', component: GameHistoryPageComponent, canActivate: mapToCanActivate([AdminAuthGuardService]) },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
