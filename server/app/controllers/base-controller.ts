import { DEFAULT_ERROR } from '@app/consts/error.consts';
import { Message } from '@common/interfaces/message';
import { StatusCodes } from 'http-status-codes';
import { Response, Router } from 'express';

export abstract class BaseController {
    router: Router;

    constructor() {
        this.router = Router();
        this.configureRouter();
    }

    protected handleError(response: Response, errorString: string) {
        const errorMessage: Message = {
            title: DEFAULT_ERROR,
            body: errorString,
        };
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorMessage);
    }

    protected async attemptOperation(response: Response, operation: () => Promise<void>) {
        try {
            await operation();
        } catch (reason) {
            this.handleError(response, reason as string);
        }
    }

    protected abstract configureRouter(): void;
}
