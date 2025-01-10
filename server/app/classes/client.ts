import { PlayerState } from '@common/enums/user-answer-state';
import { Player } from '@common/interfaces/player';
import { Socket } from 'socket.io';

export class Client implements Player {
    name: string;
    score: number;
    bonusCount: number;
    answerState: PlayerState;

    constructor(private socket: Socket) {
        this.resetState();
    }

    emitToUser<ValuType>(eventName: string, eventValue?: ValuType) {
        this.socket.emit(eventName, eventValue);
    }

    onUserEvent<EventType, CallBackArgType>(
        eventName: string,
        callback: (eventValue?: EventType, callback?: (callbackArg: CallBackArgType) => void) => void,
    ) {
        this.socket.on(eventName, callback);
    }

    removeEventListeners(eventName: string) {
        this.socket.removeAllListeners(eventName);
    }

    resetState(name?: string) {
        this.name = name ?? '';
        this.score = 0;
        this.bonusCount = 0;
        this.answerState = PlayerState.NO_ANSWER;
    }
}
