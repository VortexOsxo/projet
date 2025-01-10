import { Injectable } from '@angular/core';
import { AdminAuthenticationService } from '@app/services/admin-authentication.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AdminAuthGuardService {
    constructor(
        private readonly adminAuthenticationService: AdminAuthenticationService,
        private readonly router: Router,
    ) {}

    canActivate() {
        const isAuthenticated = this.adminAuthenticationService.isUserAuthenticated();
        if (!isAuthenticated) this.router.navigate(['/home']);
        return isAuthenticated;
    }
}
