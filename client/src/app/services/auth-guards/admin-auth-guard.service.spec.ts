import { TestBed } from '@angular/core/testing';

import { AdminAuthGuardService } from './admin-auth-guard.service';
import { AdminAuthenticationService } from '@app/services/admin-authentication.service';
import { Router } from '@angular/router';

describe('AdminAuthGuardService', () => {
    let service: AdminAuthGuardService;
    let adminAuthenticationMock: jasmine.SpyObj<AdminAuthenticationService>;
    let routerServiceMock: jasmine.SpyObj<Router>;

    beforeEach(() => {
        adminAuthenticationMock = jasmine.createSpyObj('AdminAuthenticationService', ['isUserAuthenticated']);
        routerServiceMock = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AdminAuthenticationService, useValue: adminAuthenticationMock },
                { provide: Router, useValue: routerServiceMock },
            ],
        });
        service = TestBed.inject(AdminAuthGuardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('the canActivate method should return the value of the isUserAuthenticated', () => {
        it('should return true if the user is authenticated', () => {
            adminAuthenticationMock.isUserAuthenticated.and.returnValue(true);
            const result = service.canActivate();

            expect(adminAuthenticationMock.isUserAuthenticated).toHaveBeenCalled();
            expect(result).toBeTrue();
        });

        it('should return false if user is not authenticated', () => {
            adminAuthenticationMock.isUserAuthenticated.and.returnValue(false);
            const result = service.canActivate();

            expect(adminAuthenticationMock.isUserAuthenticated).toHaveBeenCalled();
            expect(result).toBeFalse();
        });
    });

    describe('the canActivate method should redirect only if the user isnt authenticated', () => {
        const redirectPath = '/home';

        it('should redirect to home if the user is not authenticated', () => {
            adminAuthenticationMock.isUserAuthenticated.and.returnValue(false);
            service.canActivate();

            expect(routerServiceMock.navigate).toHaveBeenCalledWith([redirectPath]);
        });

        it('the canActivate method should not redirect if the user is authenticated', () => {
            adminAuthenticationMock.isUserAuthenticated.and.returnValue(true);
            service.canActivate();

            expect(routerServiceMock.navigate).not.toHaveBeenCalled();
        });
    });
});
