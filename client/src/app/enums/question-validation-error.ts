export enum QuestionValidationError {
    PointsRange = "Les points pour une bonne réponse doivent être dans l'intervalle [10 à 100]",
    PointsMultiple = 'Les points pour une bonne réponse doivent être un multiple de 10',
    ChoiceTextEmpty = 'Le texte du choix ne peut pas être vide',
    AtLeastOneCorrectIncorrect = 'Il doit y avoir au moins une réponse correcte et une réponse incorrecte',
    DuplicateQuestionTitle = 'Une question avec ce titre existe déjà',
    ErrorsRemaining = 'Il reste des erreurs dans la question',
}
