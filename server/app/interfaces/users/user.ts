export interface User {
    emitToUser<ValuType>(eventName: string, eventValue?: ValuType): void;
    removeEventListeners(eventName: string): void;
    onUserEvent<EventType>(eventName: string, callback: (eventValue: EventType) => void): void;
}
