import { Express, Router } from 'express';
import { CommonDataControllerService } from './common-data.controller';
import { SinonStubbedInstance, restore, createStubInstance, SinonSpy, spy } from 'sinon';
import { StatusCodes } from 'http-status-codes';
import { DataManagerService } from '@app/services/data/data-manager.service';
import { HasId } from '@app/interfaces/has-id';
import * as express from 'express';
import * as supertest from 'supertest';
import * as chai from 'chai';

interface MockElement extends HasId {
    name: string;
}

class CommonDataControllerServiceConcrete extends CommonDataControllerService<MockElement> {
    protected configureRouter(): void {
        // No implementation needed for the tests
    }
}

const apiRoute = '/api/mockdata';
const mockId = 'mockid';
const mockElements: MockElement[] = [
    {
        id: '0',
        name: 'a',
    },
    {
        id: '1',
        name: 'b',
    },
    {
        id: '2',
        name: 'c',
    },
];

describe('CommonDataControllerService', () => {
    let dataManagerServiceStub: SinonStubbedInstance<DataManagerService<MockElement>>;
    let expressApp: Express;
    let router: Router;

    let onElementModificationSpy: SinonSpy;

    beforeEach(() => {
        dataManagerServiceStub = createStubInstance(DataManagerService<MockElement>);

        expressApp = express();
        expressApp.use(express.json());
        router = Router();

        const commonDataControllerService = new CommonDataControllerServiceConcrete(dataManagerServiceStub, 'mockdata');
        onElementModificationSpy = spy(commonDataControllerService, 'onElementModification' as keyof CommonDataControllerService<MockElement>);

        router.get('/', commonDataControllerService.getAllElements.bind(commonDataControllerService));
        router.get('/:id', commonDataControllerService.getElementById.bind(commonDataControllerService));
        router.post('/', commonDataControllerService.addElement.bind(commonDataControllerService));
        router.put('/', commonDataControllerService.replaceElement.bind(commonDataControllerService));
        router.delete('/:id', commonDataControllerService.deleteElement.bind(commonDataControllerService));

        expressApp.use(apiRoute, router);
    });

    afterEach(() => {
        restore();
    });

    it('should return all of the elements on get request', async () => {
        dataManagerServiceStub.getElements.resolves(mockElements);

        return supertest(expressApp)
            .get(apiRoute)
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(mockElements);
            });
    });

    it('if the element isnt found, should return a not found error', async () => {
        dataManagerServiceStub.getElementById.resolves(undefined);

        return supertest(expressApp)
            .get(apiRoute + '/' + '23')
            .expect(StatusCodes.NOT_FOUND);
    });

    it('get element by id should return the proper element', async () => {
        dataManagerServiceStub.getElementById.resolves(mockElements[1]);

        return supertest(expressApp)
            .get(apiRoute + '/' + mockElements[1].id)
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(mockElements[1]);
            });
    });

    it('delete element id should return delete the element', async () => {
        dataManagerServiceStub.deleteElement.resolves(true);

        return supertest(expressApp)
            .delete(apiRoute + '/' + mockElements[1].id)
            .expect(StatusCodes.NO_CONTENT)
            .then(() => {
                chai.expect(dataManagerServiceStub.deleteElement.calledWithExactly(mockElements[1].id)).to.equal(true);
                chai.expect(onElementModificationSpy.called).to.equal(true);
            });
    });

    it('should be able to add an element when the request is valid', async () => {
        dataManagerServiceStub.addElement.resolves(true);

        return supertest(expressApp)
            .post(apiRoute)
            .send(mockElements[1])
            .expect(StatusCodes.CREATED)
            .then(() => {
                chai.expect(dataManagerServiceStub.addElement.calledWithExactly(mockElements[1])).to.equal(true);
                chai.expect(onElementModificationSpy.called).to.equal(true);
            });
    });

    it('should be able to replace an element when the request is valid', async () => {
        dataManagerServiceStub.replaceElement.resolves(true);

        return supertest(expressApp)
            .put(apiRoute)
            .send(mockElements[1])
            .expect(StatusCodes.CREATED)
            .then(() => {
                chai.expect(dataManagerServiceStub.replaceElement.calledWithExactly(mockElements[1])).to.equal(true);
                chai.expect(onElementModificationSpy.called).to.equal(true);
            });
    });

    describe('bad request', () => {
        it('not sending an id for a get request', async () => {
            dataManagerServiceStub.getElementById.resolves(undefined);

            return supertest(expressApp)
                .delete(apiRoute + '/' + '0')
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('not sending an id for a delete request', async () => {
            dataManagerServiceStub.deleteElement.resolves(undefined);

            return supertest(expressApp)
                .get(apiRoute + '/' + '0')
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('not sending a body for a post request', async () => {
            dataManagerServiceStub.addElement.resolves(undefined);

            return supertest(expressApp).post(apiRoute).expect(StatusCodes.BAD_REQUEST);
        });

        it('not sending a body for a put request', async () => {
            dataManagerServiceStub.addElement.resolves(undefined);

            return supertest(expressApp).put(apiRoute).expect(StatusCodes.BAD_REQUEST);
        });
    });

    describe('internal server error', () => {
        it('/get should handle internal server error', async () => {
            dataManagerServiceStub.getElements.rejects(new Error('Simulated internal error'));

            return supertest(expressApp)
                .get(apiRoute)
                .expect(StatusCodes.INTERNAL_SERVER_ERROR)
                .then((response) => {
                    chai.expect(response.body.title).to.equal('Error');
                });
        });

        it('/get/:id should handle internal server error', async () => {
            dataManagerServiceStub.getElementById.rejects(new Error('Simulated internal error'));

            return supertest(expressApp)
                .get(apiRoute + '/' + mockId)
                .expect(StatusCodes.INTERNAL_SERVER_ERROR)
                .then((response) => {
                    chai.expect(response.body.title).to.equal('Error');
                });
        });

        it('/post should handle internal server error', async () => {
            dataManagerServiceStub.addElement.rejects(new Error('Simulated internal error'));

            return supertest(expressApp)
                .post(apiRoute)
                .send(mockElements[2])
                .expect(StatusCodes.INTERNAL_SERVER_ERROR)
                .then((response) => {
                    chai.expect(response.body.title).to.equal('Error');
                });
        });

        it('/put should handle internal server error', async () => {
            dataManagerServiceStub.replaceElement.rejects(new Error('Simulated internal error'));

            return supertest(expressApp)
                .put(apiRoute)
                .send(mockElements[1])
                .expect(StatusCodes.INTERNAL_SERVER_ERROR)
                .then((response) => {
                    chai.expect(response.body.title).to.equal('Error');
                });
        });

        it('/delete should handle internal server error', async () => {
            dataManagerServiceStub.deleteElement.rejects(new Error('Simulated internal error'));

            return supertest(expressApp)
                .delete(apiRoute + '/' + mockId)
                .expect(StatusCodes.INTERNAL_SERVER_ERROR)
                .then((response) => {
                    chai.expect(response.body.title).to.equal('Error');
                });
        });
    });
});
