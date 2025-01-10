export enum GameManagementSocketEvent {
    CreateGameLobby = 'createGameLobby',
    CreateGameTest = 'createGameTest',
    JoinGameLobby = 'joinGameLobby',
    SetUsername = 'setUsername',
    BanPlayer = 'banPlayer',
    ToggleLock = 'toggleLock',
    StartGame = 'startGame',
    NextQuestion = 'goToNextQuestion',
    OnGameStarted = 'onGameStarted',
    CanGoToNextQuestion = 'canGoToNextquestionEvent',
}