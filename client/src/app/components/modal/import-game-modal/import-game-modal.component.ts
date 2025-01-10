import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Quiz } from '@common/interfaces/quiz';
import { QuizValidationService } from '@app/services/quiz-services/quiz-validation.service';
import { InformationModalComponent } from '@app/components/modal/information-modal/information-modal.component';
import { FileHandlerService } from '@app/services/file-handler.service';

@Component({
    selector: 'app-import-game-modal',
    templateUrl: './import-game-modal.component.html',
    styleUrls: ['./import-game-modal.component.scss'],
})
export class ImportGameModalComponent {
    @ViewChild('fileInput') fileInput!: ElementRef;
    quizToAdd: Quiz;
    invalidQuizName: boolean = false;

    // On a besoin de toutes les dépendances dans le constructeur
    // eslint-disable-next-line max-params
    constructor(
        private dialogRef: MatDialogRef<ImportGameModalComponent>,
        private fileHandlerService: FileHandlerService,
        private quizValidationService: QuizValidationService,
        private dialog: MatDialog,
    ) {}

    getFile(): File | null {
        const inputElement: HTMLInputElement = this.fileInput.nativeElement;
        const file = inputElement.files?.item(0) ?? null;
        return file;
    }

    checkFile(file: File | null): void {
        const checkFile = this.fileHandlerService.checkFile(file);
        if (!checkFile.isValid) return this.openInformationDialog(checkFile.errorMessage);

        if (file) this.processFile(file);
    }

    async processFile(file: File) {
        this.quizToAdd = await this.fileHandlerService.transformFile(file);
    }

    submitQuiz(quiz: Quiz): void {
        this.checkQuizName(quiz);
        if (this.invalidQuizName) return;

        const isQuizValid = this.quizValidationService.attemptSubmit(quiz);
        if (!isQuizValid.isValid) this.openInformationDialog(isQuizValid.errorMessage);
    }

    checkQuizName(quiz: Quiz): void {
        const checkQuiz = this.fileHandlerService.checkQuizName(quiz);

        this.invalidQuizName = !checkQuiz.isValid;
        if (this.invalidQuizName) this.openInformationDialog(checkQuiz.errorMessage);
    }

    uploadFile() {
        const file: File | null = this.getFile();
        this.checkFile(file);
        if (!this.quizToAdd) return;

        this.submitQuiz(this.quizToAdd);
        if (!this.invalidQuizName && this.quizToAdd) this.dialogRef.close();
    }

    closeDialog() {
        this.dialogRef.close();
    }

    private openInformationDialog(text: string) {
        this.dialog.open(InformationModalComponent, { data: text });
    }
}
