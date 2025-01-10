import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminLoginInputModalComponent } from '@app/components/modal/admin-login-input-modal/admin-login-input-modal.component';
import { GameIdInputModalComponent } from '@app/components/modal/game-id-input-modal/game-id-input-modal.component';
import { AdminAuthenticationService } from '@app/services/admin-authentication.service';
import { Router } from '@angular/router';
import { GameUsernameInputModalComponent } from '@app/components/modal/game-username-input-modal/game-username-input-modal.component';

@Component({
    selector: 'app-initial-view-page',
    templateUrl: './initial-view-page.component.html',
    styleUrls: ['./initial-view-page.component.scss'],
})
export class InitialViewPageComponent {
    constructor(
        private dialog: MatDialog,
        private adminAuthenticationService: AdminAuthenticationService,
        private router: Router,
    ) {}

    openJoinGameModal(): void {
        const gameIdDialog = this.dialog.open(GameIdInputModalComponent, {});
        gameIdDialog.afterClosed().subscribe((success: boolean) => {
            if (success) this.openUsernameGameModal();
        });
    }

    openAdminLoginModal(): void {
        if (this.attemptRedirectAdminPage()) return;
        const adminLoginDialog = this.dialog.open(AdminLoginInputModalComponent, {});
        adminLoginDialog.afterClosed().subscribe(() => {
            this.attemptRedirectAdminPage();
        });
    }

    private openUsernameGameModal() {
        const usernameModal = this.dialog.open(GameUsernameInputModalComponent, {});

        usernameModal.afterClosed().subscribe((success: boolean) => {
            if (success) this.router.navigate(['/game-view']);
        });
    }

    private attemptRedirectAdminPage(): boolean {
        if (this.adminAuthenticationService.isUserAuthenticated()) {
            this.router.navigate(['/admin']);
            return true;
        }
        return false;
    }
}
