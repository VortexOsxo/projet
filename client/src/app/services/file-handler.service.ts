import { Injectable } from '@angular/core';
import { ImportFileError } from '@app/enums/import-file-error';
import { InputValidity } from '@app/interfaces/input-validity';
import { QuizValidationService } from '@app/services/quiz-services/quiz-validation.service';
import { Quiz } from '@common/interfaces/quiz';
import { ValidationBaseService } from './validation-services/validation-base.service';

@Injectable({
    providedIn: 'root',
})
export class FileHandlerService extends ValidationBaseService {
    constructor(private quizValidationService: QuizValidationService) {
        super();
    }

    checkFile(file: File | null): InputValidity {
        if (!file) return this.createInvalidInputValidity(ImportFileError.NoFileChosen);
        if (file.type !== 'application/json') return this.createInvalidInputValidity(ImportFileError.InvalidFileType);

        return this.createValidInputValidity();
    }

    async transformFile(file: File): Promise<Quiz> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(this.createQuizFromReader(reader));
            reader.readAsText(file);
        });
    }

    checkQuizName(quiz: Quiz): InputValidity {
        const isQuizValid = this.quizValidationService.validateQuizName(quiz.title, quiz.id);

        if (isQuizValid.errorMessage.includes('nom'))
            return this.createInvalidInputValidity(isQuizValid.errorMessage + '\n' + ImportFileError.EnterNewName);
        return this.createValidInputValidity();
    }

    private createQuizFromReader(reader: FileReader): Quiz {
        const quizData = JSON.parse(reader.result as string);
        const { title, description, questions, duration } = quizData;
        return {
            id: '0',
            title,
            description,
            questions,
            duration,
            lastModification: new Date(),
            isVisible: false,
        };
    }
}
