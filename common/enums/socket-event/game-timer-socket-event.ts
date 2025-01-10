export enum GameTimerSocketEvent {
    TogglePause = 'toggleTimerPause',
    CanTogglePause = 'canToggleTimerPause',
    StartPanic = 'startTimerPanic',
    CanStartPanic = 'canStartTimerPanic',
    OnPanicModeStarted = 'onPanicModeStarted'
}