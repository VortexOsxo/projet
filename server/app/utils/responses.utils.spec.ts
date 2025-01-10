import { expect } from 'chai';
import { createUnsuccessfulResponse, createSuccessfulResponse } from './responses.utils';

describe('Response Utils', () => {
    describe('createUnsuccessfulResponse', () => {
        it('should return a BaseResponse with success false and the provided error message', () => {
            const errorMessage = 'Error message';
            const response = createUnsuccessfulResponse(errorMessage);
            expect(response.success).to.equal(false);
            expect(response.message).to.equal(errorMessage);
        });
    });

    describe('createSuccessfulResponse', () => {
        it('should return a BaseResponse with success true and the message "RequestCompleted"', () => {
            const response = createSuccessfulResponse();
            expect(response.success).to.equal(true);
            expect(response.message).to.equal('RequestCompleted');
        });
    });
});
