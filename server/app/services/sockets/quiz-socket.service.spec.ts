import { assert } from 'chai';
import { QuizSocket } from './quiz-socket.service';
import { SocketManager } from './socket-manager.service';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

describe('QuizSocket', () => {
    let socketManagerStub: SinonStubbedInstance<SocketManager>;
    let quizSocket: QuizSocket;

    beforeEach(() => {
        socketManagerStub = createStubInstance(SocketManager);

        quizSocket = new QuizSocket(socketManagerStub);
    });

    it('emitQuizChangedNotification should call emit method on SocketManager', () => {
        quizSocket.emitQuizChangedNotification();

        assert(socketManagerStub.emit.calledOnceWithExactly('quizChangedNotification'));
    });
});
