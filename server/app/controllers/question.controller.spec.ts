import { assert } from 'console';
import { QuestionController } from './question.controller';
import { SinonSpy, SinonStubbedInstance, createStubInstance, spy } from 'sinon';
import { DataManagerService } from '@app/services/data/data-manager.service';
import { Question } from '@common/interfaces/question';
import { QuestionSocket } from '@app/services/sockets/question-socket.service';
import * as chai from 'chai';

describe('QuestionController', () => {
    let dataManagerServiceStub: SinonStubbedInstance<DataManagerService<Question>>;
    let questionController: QuestionController;
    let questionSocketStub: SinonStubbedInstance<QuestionSocket>;
    let onModificationSpy: SinonSpy;

    beforeEach(async () => {
        dataManagerServiceStub = createStubInstance(DataManagerService<Question>);
        questionSocketStub = createStubInstance(QuestionSocket);
        questionController = new QuestionController(dataManagerServiceStub, questionSocketStub);
        onModificationSpy = spy(questionController, 'onElementModification' as keyof QuestionController);
    });

    afterEach(() => {
        onModificationSpy.restore();
    });

    it('configureRouter should define the router', async () => {
        assert(questionController.router, 'Expected router to exist');
    });

    it('onElementModification should properly call emitQuestionChangedNotification of socketManager', () => {
        questionController['onElementModification']();
        chai.expect(questionSocketStub.emitQuestionChangedNotification.called).to.equal(true);
    });
});
