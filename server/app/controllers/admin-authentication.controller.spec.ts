import { Application } from '@app/app';
import { ADMIN_PASSWORD } from '@app/consts/password.const';
import { StatusCodes } from 'http-status-codes';
import * as supertest from 'supertest';
import { Container } from 'typedi';

const apiRoute = '/api/admin-authentication';

describe('AdminAuthenticationService', () => {
    let expressApp: Express.Application;

    beforeEach(() => {
        const app = Container.get(Application);
        expressApp = app.app;
    });

    it('should return OK if the correct password is sent', async () => {
        return supertest(expressApp).post(apiRoute).send({ password: ADMIN_PASSWORD }).expect(StatusCodes.OK);
    });

    it('Should return forbiden if a wrong password is sent', async () => {
        return supertest(expressApp).post(apiRoute).send({ password: 'wrong' }).expect(StatusCodes.FORBIDDEN);
    });

    it('Should not cause error if not password is sent', async () => {
        return supertest(expressApp).post(apiRoute).expect(StatusCodes.FORBIDDEN);
    });
});
