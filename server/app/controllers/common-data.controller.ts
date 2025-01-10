import { DataManagerService } from '@app/services/data/data-manager.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HasId } from '@app/interfaces/has-id';
import { EMPTY_ID } from '@app/consts/database.consts';
import { BaseController } from './base-controller';

export abstract class CommonDataControllerService<DataType extends HasId> extends BaseController {
    constructor(
        protected dataManagerService: DataManagerService<DataType>,
        protected collectionName: string,
    ) {
        super();
        this.dataManagerService.setCollection(collectionName);
    }

    async getAllElements(request: Request, response: Response): Promise<void> {
        await this.attemptOperation(response, async () => {
            const elements = await this.dataManagerService.getElements();
            response.json(elements);
        });
    }

    async getElementById(request: Request, response: Response): Promise<void> {
        const id = request.params.id;
        if (!this.validateArgumentId(response, id)) return;

        await this.attemptOperation(response, async () => {
            const element = await this.dataManagerService.getElementById(id);

            if (!element) {
                response.status(StatusCodes.NOT_FOUND).send();
            } else {
                response.status(StatusCodes.OK).json(element);
            }
        });
    }

    async addElement(request: Request, response: Response): Promise<void> {
        const newElement: DataType = request.body;
        if (!this.validateElementArgument(response, newElement)) return;

        await this.attemptOperation(response, async () => {
            await this.dataManagerService.addElement(newElement);
            this.onElementModification();
            response.status(StatusCodes.CREATED).send();
        });
    }

    async replaceElement(request: Request, response: Response): Promise<void> {
        const replacement: DataType = request.body;
        if (!this.validateElementArgument(response, replacement)) return;

        await this.attemptOperation(response, async () => {
            await this.dataManagerService.replaceElement(replacement);
            this.onElementModification();
            response.status(StatusCodes.CREATED).send();
        });
    }

    async deleteElement(request: Request, response: Response): Promise<void> {
        const id = request.params.id;
        if (!this.validateArgumentId(response, id)) return;
        await this.attemptOperation(response, async () => {
            await this.dataManagerService.deleteElement(id);

            this.onElementModification();
            response.status(StatusCodes.NO_CONTENT).send();
        });
    }

    protected onElementModification(): void {
        // this function can be overriden by subclass if it's needed but we dont have to hence the empty function
    }

    private isModifyElementRequestValid(replacement: DataType) {
        return replacement && Object.keys(replacement).length;
    }

    private validateElementArgument(response: Response, element: DataType): boolean {
        if (this.isModifyElementRequestValid(element)) return true;

        response.status(StatusCodes.BAD_REQUEST).send();
        return false;
    }

    private isIdDefined(id: string) {
        return id && id !== EMPTY_ID;
    }

    private validateArgumentId(response: Response, id: string): boolean {
        if (this.isIdDefined(id)) return true;

        response.status(StatusCodes.BAD_REQUEST).send();
        return false;
    }
}
