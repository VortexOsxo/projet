import { assert } from 'console';
import { QuizController } from './quiz.controller';
import { SinonStubbedInstance, createStubInstance, SinonSpy, spy } from 'sinon';
import { DataManagerService } from '@app/services/data/data-manager.service';
import { Quiz } from '@common/interfaces/quiz';
import * as chai from 'chai';
import { QuizSocket } from '@app/services/sockets/quiz-socket.service';

describe('QuizController', () => {
    let dataManagerServiceStub: SinonStubbedInstance<DataManagerService<Quiz>>;
    let quizSocketStub: SinonStubbedInstance<QuizSocket>;
    let quizController: QuizController;
    let onModificationSpy: SinonSpy;

    beforeEach(() => {
        dataManagerServiceStub = createStubInstance(DataManagerService<Quiz>);
        quizSocketStub = createStubInstance(QuizSocket);
        quizController = new QuizController(dataManagerServiceStub, quizSocketStub);

        onModificationSpy = spy(quizController, 'onElementModification' as keyof QuizController);
    });

    afterEach(() => {
        onModificationSpy.restore();
    });

    it('configureRouter should define the router', () => {
        assert(quizController.router, 'Expected router to exist');
    });

    it('onElementModification should properly call emitQuizChangedNotification of socketManager', () => {
        quizController['onElementModification']();
        chai.expect(quizSocketStub.emitQuizChangedNotification.called).to.equal(true);
    });
});
