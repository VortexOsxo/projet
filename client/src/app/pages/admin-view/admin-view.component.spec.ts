import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AdminViewComponent } from './admin-view.component';
import { QuizValidationService } from '@app/services/quiz-services/quiz-validation.service';
import { Quiz } from '@common/interfaces/quiz';
import { QuizService } from '@app/services/quiz-services/quiz.service';
import { ImportGameModalComponent } from '@app/components/modal/import-game-modal/import-game-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { LogoTitleComponent } from '@app/components/logo-title/logo-title.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AdminViewComponent', () => {
    let mockQuizzes: Quiz[];
    let component: AdminViewComponent;
    let fixture: ComponentFixture<AdminViewComponent>;
    let mockQuizService: jasmine.SpyObj<QuizService>;
    let mockMatDialog: jasmine.SpyObj<MatDialog>;
    let mockQuizValidationService: jasmine.SpyObj<QuizValidationService>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<ImportGameModalComponent>>;

    const mockQuizEvent = new Subject<void>();
    const mockQuizEventInfoObservable = mockQuizEvent.asObservable();

    beforeEach(() => {
        mockQuizzes = [
            { id: '1', title: 'Quiz 1', description: 'Description 1', questions: [], duration: 60, lastModification: new Date(), isVisible: true },
            { id: '2', title: 'Quiz 2', description: 'Description 2', questions: [], duration: 90, lastModification: new Date(), isVisible: false },
        ];

        mockQuizService = jasmine.createSpyObj('QuizService', ['getAllQuiz', 'removeQuiz', 'toggleVisibility', 'getQuizModificationObservable'], {
            quizEventInfoObservable: mockQuizEventInfoObservable,
        });
        (mockQuizService.getAllQuiz as jasmine.Spy).and.returnValue(mockQuizzes);
        mockQuizService.getQuizModificationObservable.and.returnValue(mockQuizEvent.asObservable());
        mockQuizService['quizModificationSubject'] = mockQuizEvent as Subject<void>;

        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
        mockQuizValidationService = jasmine.createSpyObj('QuizValidationService', ['attemptSubmit', 'setQuizToModify']);

        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);

        TestBed.configureTestingModule({
            declarations: [AdminViewComponent, LogoTitleComponent],
            providers: [
                { provide: QuizService, useValue: mockQuizService },
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: QuizValidationService, useValue: mockQuizValidationService },
                { provide: MatDialogRef, useValue: mockDialogRef },
            ],
            imports: [MatDialogModule, MatIconModule, MatExpansionModule, BrowserAnimationsModule],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should properly update the quizzes on event from quiz service', () => {
        (mockQuizService.getAllQuiz as jasmine.Spy).calls.reset();

        mockQuizService['quizModificationSubject'].next();

        expect(mockQuizService.getAllQuiz).toHaveBeenCalled();
    });

    it('should load quizzes on initialization', () => {
        component.ngOnInit();

        expect(mockQuizService.getAllQuiz).toHaveBeenCalled();
        expect(component.quizzes).toEqual(mockQuizzes);
    });

    it('should call removeQuiz from quizService with proper argument', () => {
        const mockQuizToDelete = mockQuizzes[0];

        component.deleteQuiz(mockQuizToDelete);
        expect(mockQuizService.removeQuiz).toHaveBeenCalledWith(mockQuizToDelete.id);
    });

    it('should call toggleVisibility from quizService with proper argument', () => {
        const mockQuizToToggle = mockQuizzes[0];
        component.toggleVisibility(mockQuizToToggle);
        expect(mockQuizService.toggleVisibility).toHaveBeenCalledWith(mockQuizToToggle.id);
    });

    it('should return visibility icon name', () => {
        const mockVisibleQuiz = mockQuizzes[0];
        const mockInvisibleQuiz = mockQuizzes[1];
        expect(component.visibility(mockVisibleQuiz)).toBe('visibility');
        expect(component.visibility(mockInvisibleQuiz)).toBe('visibility_off');
    });

    it('should call setQuizToModify from quizValidationService with proper argument', () => {
        const mockQuizToModify = mockQuizzes[0];
        component.modifyQuiz(mockQuizToModify);
        expect(mockQuizValidationService.setQuizToModify).toHaveBeenCalledWith(mockQuizToModify);
    });

    it('should download file with correct content and file name', () => {
        const content = 'test content';
        const fileName = 'test.json';

        spyOn(URL, 'createObjectURL').and.returnValue('test_url');
        const anchorClickSpy = spyOn(HTMLAnchorElement.prototype, 'click');

        component.download(content, fileName);

        expect(URL.createObjectURL).toHaveBeenCalledWith(new Blob([content], { type: 'application/json' }));

        const anchorElement = document.createElement('a');
        anchorElement.href = 'test_url';
        anchorElement.download = fileName;
        anchorElement.click();
        expect(anchorClickSpy).toHaveBeenCalled();
    });

    it('should export quiz', () => {
        const quiz: Quiz = mockQuizzes[0];
        const mockDownload = spyOn(component, 'download');
        component.exportQuiz(quiz);
        const expectedJsonString = JSON.stringify(quiz, (key: string, value: unknown) => (key === 'isVisible' ? undefined : value), 2);
        const expectedFileName = quiz.title + '.json';
        expect(mockDownload).toHaveBeenCalledWith(expectedJsonString, expectedFileName);
    });

    it('should open import modal', () => {
        const mockModalResult = {};
        mockMatDialog.open.and.returnValue(mockDialogRef);
        mockDialogRef.afterClosed.and.returnValue(of(mockModalResult));
        component.openImportModal();
        expect(mockMatDialog.open).toHaveBeenCalledWith(ImportGameModalComponent, {});
        expect(mockDialogRef.afterClosed).toHaveBeenCalled();
    });
});
