export enum QuizValidationError {
    InvalidDuration = 'La durée de réponse doit être entre 10 et 60 secondes inclusivement',
    QuizNameAlreadyExists = 'Un quiz avec ce nom existe déjà',
    QuizNameEmpty = 'Le nom du quiz ne peut pas être vide',
    QuizDescriptionEmpty = 'La description du quiz ne peut pas être vide',
    QuizErrorsDetected = 'Des erreurs ont été détectées dans le quiz:\n',
    NeedAtLeastOneQuestion = 'Votre quiz doit posséder au moins une question:\n',
    QuizInvalidQuestions = 'Vous avez au moins une question invalide\n',
    UnavailableQuiz = "Le quizz sélectionné n'est plus disponible",
}
