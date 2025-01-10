import { Router, Request, Response } from 'express';
import { Service } from 'typedi';
import { StatusCodes } from 'http-status-codes';
import { BaseController } from './base-controller';
import { GameHistoryService } from '@app/services/game/game-history.service';

@Service()
export class GameHistoryController extends BaseController {
    router: Router;

    constructor(private gameHistoryService: GameHistoryService) {
        super();
    }

    protected configureRouter(): void {
        this.router.get('/', async (request: Request, response: Response) => {
            await this.attemptOperation(response, async () => {
                const history = await this.gameHistoryService.getHistory();
                response.json(history);
            });
        });

        this.router.delete('/', async (request: Request, response: Response) => {
            await this.attemptOperation(response, async () => {
                this.gameHistoryService.deleteHistory();
                response.status(StatusCodes.OK).send();
            });
        });
    }
}
