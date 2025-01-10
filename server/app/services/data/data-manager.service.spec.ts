import { SinonStub, stub, restore } from 'sinon';
import { Container } from 'typedi';
import { DataManagerService } from './data-manager.service';
import { DataBaseAcces } from './database-acces.service';
import { expect } from 'chai';

interface MockIdObject {
    id: string;
    test: number;
}

const mockData: MockIdObject = {
    id: '0',
    test: 5,
};

describe('DataManagerService', () => {
    let dataManagerService: DataManagerService<MockIdObject>;
    let dbAccesStub: SinonStub;
    let insertOneStub: SinonStub;
    let deleteOneStub: SinonStub;
    let findOneStub: SinonStub;
    let findStub: SinonStub;
    let replaceOneStub: SinonStub;
    let deleteManyStub: SinonStub;

    beforeEach(() => {
        insertOneStub = stub().resolves({ acknowledged: true });
        deleteOneStub = stub().resolves({ acknowledged: true });
        findOneStub = stub();
        const toArrayStub = stub().resolves([{ id: 'mockId', test: 42 }]);
        findStub = stub().returns({ toArray: toArrayStub });
        replaceOneStub = stub().resolves({ acknowledged: true });
        deleteManyStub = stub().resolves({ acknowledged: true });

        const collectionStub = stub().withArgs('mockCollection').returns({
            insertOne: insertOneStub,
            deleteOne: deleteOneStub,
            findOne: findOneStub,
            find: findStub,
            replaceOne: replaceOneStub,
            deleteMany: deleteManyStub,
        });

        const fakeDb = {
            collection: collectionStub,
        };

        const fakeDbAcces = {
            database: fakeDb,
        };

        // We need to cast as any to properly stub the method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbAccesStub = stub(Container, 'get' as any).withArgs(DataBaseAcces);
        dbAccesStub.returns(fakeDbAcces);

        dataManagerService = new DataManagerService<MockIdObject>(Container.get(DataBaseAcces));

        dataManagerService.setCollection('mockCollection');
    });

    afterEach(() => {
        restore();
    });

    describe('addElement:', () => {
        it('if the id is null, should call findOne but not replace', async () => {
            const result = await dataManagerService.addElement(mockData);

            expect(insertOneStub.calledOnce).to.equal(true);
            expect(findOneStub.calledOnce).to.equal(true);
            expect(replaceOneStub.notCalled).to.equal(true);
            expect(result).to.equal(true);
        });

        it('if the id already exist, should call findOne and replaceOne but not inserOne', async () => {
            mockData.id = 'mockid';
            findOneStub.resolves(mockData);

            const result = await dataManagerService.addElement(mockData);

            expect(insertOneStub.notCalled).to.equal(true);
            expect(findOneStub.calledOnce).to.equal(true);
            expect(replaceOneStub.calledOnce).to.equal(true);
            expect(result).to.equal(true);
        });
    });

    it('deleteElement: should call deleteOne with the correct argument', async () => {
        await dataManagerService.deleteElement(mockData.id);

        expect(deleteOneStub.calledOnceWithExactly({ id: mockData.id })).to.equal(true);
    });

    describe('findElementById:', () => {
        it('should call find with the proper arguemnt', async () => {
            findOneStub.resolves(mockData);
            await dataManagerService.getElementById(mockData.id);
            expect(findOneStub.calledOnceWithExactly({ id: mockData.id }, { projection: { _id: 0 } })).to.equal(true);
        });

        it('should remove the _id attribute', async () => {
            findOneStub.resolves(mockData);
            const result = await dataManagerService.getElementById(mockData.id);
            expect(result).to.deep.equal(mockData);
        });

        it('should return null if not found', async () => {
            findOneStub.resolves(null);
            const result = await dataManagerService.getElementById(mockData.id);
            expect(result).to.equal(null);
        });
    });

    it('findElements: should call the find method and remove the _id attribute', async () => {
        const elements = await dataManagerService.getElements();

        expect(findStub.calledOnce).to.equal(true);
        expect(elements).to.deep.equal([{ id: 'mockId', test: 42 }]);
    });

    it('replaceElement: should call replaceOne with the correct arguments and return true', async () => {
        const replacement: MockIdObject = { id: 'mockId', test: 42 };

        const result = await dataManagerService.replaceElement(replacement);

        expect(replaceOneStub.calledOnceWithExactly({ id: 'mockId' }, replacement)).to.equal(true);
        expect(result).to.equal(true);
    });

    describe('deleteAllElements', () => {
        it('should call deleteMany on the database collection', async () => {
            const result = await dataManagerService.deleteAllElements();
            expect(deleteManyStub.calledOnceWithExactly({})).to.equal(true);
            expect(result).to.equal(true);
        });
    });
});
