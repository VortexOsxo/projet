import { BaseController } from './base-controller';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SinonStubbedInstance, stub } from 'sinon';
import { expect } from 'chai';

class ConcreteBaseController extends BaseController {
    protected configureRouter(): void {
        // No implementation needed for the tests
    }
}

describe('BaseController', () => {
    let baseController: BaseController;
    let responseMock: SinonStubbedInstance<Response>;

    beforeEach(() => {
        baseController = new ConcreteBaseController();
        responseMock = {
            status: stub().returnsThis(),
            json: stub().returnsThis(),
        } as SinonStubbedInstance<Response>;
    });

    describe('Constructor', () => {
        it('should initialize router', () => {
            expect(baseController.router).to.not.equal(undefined);
        });
    });

    describe('handleError', () => {
        it('should set status to INTERNAL_SERVER_ERROR and send error message', () => {
            const errorString = 'Test error';
            baseController['handleError'](responseMock, errorString);
            expect(responseMock.status.calledOnceWithExactly(StatusCodes.INTERNAL_SERVER_ERROR)).to.equal(true);
            expect(responseMock.json.called).to.equal(true);
        });
    });

    describe('attemptOperation', () => {
        it('should call operation', async () => {
            const operationStub = stub().resolves();
            await baseController['attemptOperation'](responseMock, operationStub);
            expect(operationStub.calledOnce).to.equal(true);
        });
    });
});
