import { HttpClient, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AdminAuthenticationService {
    private isAuthenticated: boolean;

    constructor(private readonly http: HttpClient) {
        this.isAuthenticated = false;
    }

    private get adminRouteUrl() {
        return `${environment.serverUrl}/admin-authentication`;
    }

    attemptAuthentication(adminPassword: string): Observable<boolean> {
        return this.http.post(this.adminRouteUrl, { password: adminPassword }, { observe: 'response', responseType: 'text' }).pipe(
            map((response: HttpResponse<string>) => {
                this.isAuthenticated = response.status === HttpStatusCode.Ok;
                return this.isAuthenticated;
            }),
            catchError(() => {
                return of(false);
            }),
        );
    }

    isUserAuthenticated(): boolean {
        return this.isAuthenticated;
    }
}
