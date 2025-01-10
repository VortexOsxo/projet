import { Request, Response, Router } from 'express';
import { SinonStubbedInstance, stub, createStubInstance, SinonStub, restore } from 'sinon';
import { expect } from 'chai';
import { GameHistoryController } from './game-history.controller';
import { GameHistory } from '@common/interfaces/game-history';
import { GameHistoryService } from '@app/services/game/game-history.service';

describe('GameHistoryController', () => {
    let gameHistoryServiceStub: SinonStubbedInstance<GameHistoryService>;
    let controller: GameHistoryController;
    let routerMock: Router;

    let responseJsonStub: SinonStub;
    let responseStatusStub: SinonStub;
    let sendStub: SinonStub;

    let requestMock: Request;
    let responseMock: Response;

    beforeEach(() => {
        gameHistoryServiceStub = createStubInstance(GameHistoryService);

        routerMock = {
            get: stub(),
            delete: stub(),
        } as unknown as Router;

        controller = new GameHistoryController(gameHistoryServiceStub);
        controller.router = routerMock;
        controller['configureRouter']();

        sendStub = stub();
        responseJsonStub = stub();
        responseStatusStub = stub();
        responseStatusStub.returns({ send: sendStub });

        requestMock = {} as unknown as Request;

        responseMock = {
            json: responseJsonStub,
            status: responseStatusStub,
        } as unknown as Response;
    });

    afterEach(() => {
        restore();
    });

    describe('GET /', () => {
        it('should return game history data', async () => {
            const elements: GameHistory[] = [
                { id: '1', bestScore: 100 },
                { id: '2', bestScore: 200 },
            ] as GameHistory[];
            await gameHistoryServiceStub.getHistory.resolves(elements);

            const firstCallArgs = (routerMock.get as SinonStub).firstCall.args;
            await firstCallArgs[1](requestMock, responseMock);

            expect(gameHistoryServiceStub.getHistory.calledOnce).to.equal(true);
            expect(responseJsonStub.calledOnceWithExactly(elements)).to.equal(true);
        });
    });

    describe('DELETE /', () => {
        it('should delete all game history using the gameHistoryService', async () => {
            gameHistoryServiceStub.deleteHistory.resolves();

            const deleteCallback = (routerMock.delete as SinonStub).firstCall.args;
            await deleteCallback[1](requestMock, responseMock);

            expect(gameHistoryServiceStub.deleteHistory.calledOnce).to.equal(true);
        });
    });
});
