import { Request, Response } from 'express';
import { Service } from 'typedi';
import { StatusCodes } from 'http-status-codes';
import { ADMIN_PASSWORD } from '@app/consts/password.const';
import { BaseController } from './base-controller';

@Service()
export class AdminAuthenticationController extends BaseController {
    protected configureRouter(): void {
        this.router.post('/', (req: Request, res: Response) => {
            const inputPassword: string = req.body.password;
            res.status(inputPassword === ADMIN_PASSWORD ? StatusCodes.OK : StatusCodes.FORBIDDEN).send();
        });
    }
}
