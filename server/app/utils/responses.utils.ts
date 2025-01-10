import { Response } from '@common/interfaces/response';

export const createUnsuccessfulResponse = (errorMessage: string): Response => {
    return {
        success: false,
        message: errorMessage,
    };
};

export const createSuccessfulResponse = () => {
    return {
        success: true,
        message: 'RequestCompleted',
    };
};
