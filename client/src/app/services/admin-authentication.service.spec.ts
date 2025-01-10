import { HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { AdminAuthenticationService } from './admin-authentication.service';

describe('AdminAuthenticationService', () => {
    const baseUrl: string = environment.serverUrl;
    let service: AdminAuthenticationService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AdminAuthenticationService],
        });

        service = TestBed.inject(AdminAuthenticationService);
        httpMock = TestBed.inject(HttpTestingController);
        service['isAuthenticated'] = false;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('attempt Authentication tests', () => {
        it('should authenticate the user if he inputs the right password', async () => {
            const response = { status: HttpStatusCode.Ok, statusText: '' };

            service.attemptAuthentication('password').subscribe((authenticationResult) => {
                expect(authenticationResult).toEqual(true);
                expect(service['isAuthenticated']).toEqual(true);
            });

            const req = httpMock.expectOne(`${baseUrl}/admin-authentication`);
            expect(req.request.method).toBe('POST');

            req.flush(true, response);
        });

        it('should not authenticate the user if he inputs the wrong password', async () => {
            const errorResponse = { status: HttpStatusCode.Forbidden, statusText: '' };

            service.attemptAuthentication('not password').subscribe((authenticationResult) => {
                expect(authenticationResult).toEqual(false);
                expect(service['isAuthenticated']).toEqual(false);
            });

            const req = httpMock.expectOne(`${baseUrl}/admin-authentication`);
            expect(req.request.method).toBe('POST');

            req.flush(false, errorResponse);
        });
    });

    describe('isUserAuthenticated tests', () => {
        it('should return false if the user is not authenticated', () => {
            service['isAuthenticated'] = false;
            const isAuthenticated = service.isUserAuthenticated();
            expect(isAuthenticated).toBeFalse();
        });

        it('should return true if the user is authenticated', () => {
            service['isAuthenticated'] = true;
            const isAuthenticated = service.isUserAuthenticated();
            expect(isAuthenticated).toBeTrue();
        });
    });
});
