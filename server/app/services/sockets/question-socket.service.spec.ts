import { assert } from 'chai';
import { QuestionSocket } from './question-socket.service';
import { SocketManager } from './socket-manager.service';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

describe('QuizSocket', () => {
    let socketManagerStub: SinonStubbedInstance<SocketManager>;
    let questionSocket: QuestionSocket;

    beforeEach(() => {
        socketManagerStub = createStubInstance(SocketManager);

        questionSocket = new QuestionSocket(socketManagerStub);
    });

    it('emitQuestionChangedNotification should call emit method on SocketManager', () => {
        questionSocket.emitQuestionChangedNotification();

        assert(socketManagerStub.emit.calledOnceWithExactly('questionChangedNotification'));
    });
});
