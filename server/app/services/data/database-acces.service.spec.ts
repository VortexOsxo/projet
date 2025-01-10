import { Container } from 'typedi';
import { DataBaseAcces } from './database-acces.service';
import { restore } from 'sinon';
import { assert } from 'console';

describe('DataBaseAcces Service', () => {
    let dataBaseAcces: DataBaseAcces;

    beforeEach(() => {
        dataBaseAcces = Container.get(DataBaseAcces);
    });

    afterEach(() => {
        restore();
    });

    it('should connect to the database and define client and db', async () => {
        await dataBaseAcces.connectToServer();

        assert(dataBaseAcces.database, 'Expected db to exist');
        assert(dataBaseAcces.client, 'Expected client to exist');
    });
});
