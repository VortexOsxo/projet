import { OptionalUnlessRequiredId } from 'mongodb';
import { Service } from 'typedi';
import { randomUUID } from 'crypto';
import { DataBaseAcces } from './database-acces.service';
import { HasId } from '@app/interfaces/has-id';
import { EMPTY_ID } from '@app/consts/database.consts';

@Service({ transient: true })
export class DataManagerService<T extends HasId> {
    private collectionName: string;

    constructor(private dbAcces: DataBaseAcces) {}

    setCollection(collectionName: string) {
        this.collectionName = collectionName;
    }

    async addElement(element: T): Promise<boolean> {
        if (element.id === EMPTY_ID) element.id = randomUUID();

        if (await this.getElementById(element.id)) return await this.replaceElement(element);

        const collection = this.getCollection();

        const result = await collection.insertOne(element as OptionalUnlessRequiredId<T>);
        return result.acknowledged;
    }

    async deleteElement(id: string): Promise<boolean> {
        const collection = this.getCollection();
        const result = await collection.deleteOne({ id });

        return result.acknowledged;
    }

    async deleteAllElements(): Promise<boolean> {
        const collection = this.getCollection();
        const result = await collection.deleteMany({});

        return result.acknowledged;
    }

    async getElements(): Promise<T[]> {
        const collection = this.getCollection();
        const elements = await collection.find({}, { projection: { _id: 0 } }).toArray();

        return elements as unknown as T[];
    }

    async getElementById(id: string): Promise<T | null> {
        const collection = this.getCollection();
        const element = await collection.findOne({ id }, { projection: { _id: 0 } });

        if (!element) return null;
        return element as unknown as T;
    }

    async replaceElement(replacement: T): Promise<boolean> {
        const collection = this.getCollection();
        const idToReplace = replacement.id;

        const result = await collection.replaceOne({ id: idToReplace }, replacement);

        return result.acknowledged;
    }

    private getCollection() {
        return this.dbAcces.database.collection(this.collectionName);
    }
}
