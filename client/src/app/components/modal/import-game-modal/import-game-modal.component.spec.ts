import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ImportGameModalComponent } from './import-game-modal.component';
import { QuizValidationService } from '@app/services/quiz-services/quiz-validation.service';
import { InformationModalComponent } from '@app/components/modal/information-modal/information-modal.component';
import { Quiz } from '@common/interfaces/quiz';

describe('ImportGameModalComponent', () => {
    let component: ImportGameModalComponent;
    let fixture: ComponentFixture<ImportGameModalComponent>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<ImportGameModalComponent>>;
    let mockQuizValidationService: jasmine.SpyObj<QuizValidationService>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;
    let mockFile: File;
    let mockQuiz: Quiz;

    beforeEach(() => {
        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        mockQuizValidationService = jasmine.createSpyObj('QuizValidationService', ['attemptSubmit', 'validateQuizName']);
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
        mockFile = new File(['{ "title": "Quiz", "description": "Description", "questions": [], "duration": 60 }'], 'quiz.json', {
            type: 'application/json',
        });
        mockQuiz = {
            id: '0',
            title: 'Invalid Quiz',
            description: 'Description',
            questions: [],
            duration: 60,
            lastModification: new Date(),
            isVisible: true,
        };

        TestBed.configureTestingModule({
            declarations: [ImportGameModalComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: QuizValidationService, useValue: mockQuizValidationService },
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
            imports: [MatDialogModule],
        }).compileComponents();
        fixture = TestBed.createComponent(ImportGameModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not alert with correct file', () => {
        component.checkFile(mockFile);

        expect(mockMatDialog.open).not.toHaveBeenCalled();
    });

    it('should show an alert if no file is selected', () => {
        component.checkFile(null);

        expect(mockMatDialog.open).toHaveBeenCalledWith(InformationModalComponent, {
            data: 'Veuillez choisir un fichier.',
        });
    });

    it('should show an alert if an invalid file type is selected', () => {
        const mockWrongFile = new File(['{ "title": "Quiz", "description": "Description", "questions": [], "duration": 60 }'], 'quiz.txt', {
            type: 'text/plain',
        });

        component.checkFile(mockWrongFile);

        expect(mockMatDialog.open).toHaveBeenCalledWith(InformationModalComponent, {
            data: 'Fichier invalide. Veuillez choisir un fichier JSON.',
        });
    });

    it('should close dialog when closeDialog is called', () => {
        component.closeDialog();
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should submit quiz', () => {
        spyOn(component, 'submitQuiz');
        spyOn(component, 'checkFile');
        component.checkFile = jasmine.createSpy().and.returnValue(mockFile);
        component.quizToAdd = {
            id: '0',
            title: 'Invalid Quiz',
            description: 'Description',
            questions: [],
            duration: 60,
            lastModification: new Date(),
            isVisible: true,
        };
        component.uploadFile();

        expect(component.submitQuiz).toHaveBeenCalled();
    });

    it('should handle invalid quiz name', () => {
        const errorMessages = 'Un quiz avec ce nom exsite déjà\nVeuillez entrer un nouveau nom.';
        component.checkFile = jasmine.createSpy().and.returnValue(mockFile);
        mockQuizValidationService.validateQuizName.and.returnValue({ errorMessage: 'Un quiz avec ce nom exsite déjà', isValid: false });
        component.checkQuizName(mockQuiz);
        expect(mockMatDialog.open).toHaveBeenCalledWith(InformationModalComponent, { data: errorMessages });
    });

    it('should handle quiz submission error', () => {
        const errorMessages = 'Des erreurs ont été détectées dans le quiz:\nVous avez au moins une question invalide\n';
        mockQuizValidationService.validateQuizName.and.returnValue({ errorMessage: '', isValid: true });
        mockQuizValidationService.attemptSubmit.and.returnValue({ errorMessage: errorMessages, isValid: false });
        component.submitQuiz(mockQuiz);
        expect(mockMatDialog.open).toHaveBeenCalledWith(InformationModalComponent, { data: errorMessages });
    });

    it('should not close dialog if quizToAdd is falsy', () => {
        component.uploadFile();
        expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should close dialog if quizToAdd is truthy', () => {
        component.quizToAdd = {
            id: '0',
            title: 'Invalid Quiz',
            description: 'Description',
            questions: [],
            duration: 60,
            lastModification: new Date(),
            isVisible: true,
        };
        mockQuizValidationService.validateQuizName.and.returnValue({ errorMessage: '', isValid: true });
        mockQuizValidationService.attemptSubmit.and.returnValue({ errorMessage: '', isValid: true });
        component.uploadFile();
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should not attempt submit with invalid quiz name', () => {
        mockQuizValidationService.validateQuizName.and.returnValue({ errorMessage: 'Un quiz avec ce nom exsite déjà', isValid: false });
        component.submitQuiz(mockQuiz);
        expect(mockQuizValidationService.attemptSubmit).not.toHaveBeenCalled();
    });
});
