export enum GameAnswerSocketEvent {
    AnswerCollected = 'answerCollectedEvent',
    SubmitAnswer = 'submitAnswers',
    ToggleAnswerChoices = 'toggleAnswerChoice',
    UpdateAnswerResponse = 'updateAnswerResponse',
    SendCorrectAnswer = 'correctAnswers',
    SendAnswerStats = 'sendAnswerStats',
    SendAnswerToCorrect = 'sendAnswersToCorrect',
    SendAnswersCorrected = 'sendAnswersCorrected',
    SendCorrectionMessage = 'sendCorrectionMessage',
}