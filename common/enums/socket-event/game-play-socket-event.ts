export enum GamePlaySocketEvent {
    TimerTicked = 'timerTicked',
    UpdateGameState = 'updateGameState',
    SetAsOrganizer = 'setAsOrganizer',
    SetAsPlayer = 'setAsPlayer',
    FinishedTestGame = 'finishedTestGame',
    SendGameInfo = 'sendGameInfo',
    SendQuestionData = 'questionData',
}