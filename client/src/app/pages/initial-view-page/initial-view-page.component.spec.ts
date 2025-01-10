import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { LogoTitleComponent } from '@app/components/logo-title/logo-title.component';
import { InitialViewPageComponent } from './initial-view-page.component';
import { GameIdInputModalComponent } from '@app/components/modal/game-id-input-modal/game-id-input-modal.component';
import { AdminLoginInputModalComponent } from '@app/components/modal/admin-login-input-modal/admin-login-input-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

describe('InitialViewPageComponent', () => {
    let component: InitialViewPageComponent;
    let fixture: ComponentFixture<InitialViewPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let dialog: MatDialog;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        routerSpy.navigate.and.callThrough();

        TestBed.configureTestingModule({
            declarations: [InitialViewPageComponent, LogoTitleComponent],
            imports: [MatDialogModule, HttpClientModule],
            providers: [{ provide: Router, useValue: routerSpy }],
        });
        fixture = TestBed.createComponent(InitialViewPageComponent);
        component = fixture.componentInstance;
        dialog = TestBed.inject(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open join game modal', () => {
        const dialogRefMock = jasmine.createSpyObj<MatDialogRef<GameIdInputModalComponent>>(['afterClosed']);
        dialogRefMock.afterClosed.and.returnValue(of(['gameId']));

        spyOn(dialog, 'open').and.returnValue(dialogRefMock);

        component.openJoinGameModal();

        expect(dialog.open).toHaveBeenCalledWith(GameIdInputModalComponent, {});
    });

    it('should open admin login modal and and if is logged on close', () => {
        const dialogRefMock = jasmine.createSpyObj<MatDialogRef<AdminLoginInputModalComponent>>(['afterClosed']);

        spyOn(component['adminAuthenticationService'], 'isUserAuthenticated').and.returnValue(false);
        dialogRefMock.afterClosed.and.returnValue(of('password'));

        spyOn(dialog, 'open').and.returnValue(dialogRefMock);

        component.openAdminLoginModal();

        expect(dialog.open).toHaveBeenCalledWith(AdminLoginInputModalComponent, {});
    });

    it('if the user is already logged in, should not open the log in modal', () => {
        spyOn(component['adminAuthenticationService'], 'isUserAuthenticated').and.returnValue(true);

        spyOn(dialog, 'open').and.callThrough();

        component.openAdminLoginModal();

        expect(dialog.open).not.toHaveBeenCalled();
    });

    describe('redirection test', () => {
        it(' should redirect to adminpage if the user is authenticated as admin', () => {
            spyOn(component['adminAuthenticationService'], 'isUserAuthenticated').and.returnValue(true);

            expect(component['attemptRedirectAdminPage']()).toBeTrue();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
        });

        it('should redirect to adminpage if the user is not authenticated as admin', () => {
            spyOn(component['adminAuthenticationService'], 'isUserAuthenticated').and.returnValue(false);

            expect(component['attemptRedirectAdminPage']()).toBeFalse();
            expect(routerSpy.navigate).not.toHaveBeenCalled();
        });
    });
});
