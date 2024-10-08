import { Component, Output, Input, EventEmitter, HostListener, Renderer2 } from '@angular/core';
import { Diagnostic, Response, Question } from 'src/app/_models/http_resource';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../_services/dialog/dialog.component';
import { DiagnosticService, UserService, TemplateService, DefaultDiagnosticService, TagService } from '../../_services/resource.service';

@Component({
  selector: 'app-theme-question-display',
  templateUrl: './theme-question-display.component.html',
  styleUrls: ['./theme-question-display.component.css'],
})

export class ThemeQuestionDisplayComponent {
  toolbarOptions = [
    ['bold', 'italic', 'underline'],        // toggled buttons
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link'],
  ];

  editorOptions = {
    toolbar: this.toolbarOptions,
  };

  minHeight = {
    'min-height': '200px'
  };

  hoverLeft = false; // Variable to check if back are currently being hovered on.
  hoverRight = false; // Variable to check if back are currently being hovered on.
  @Input() diagnostic;
  @Input() flattenedQuestionMap;
  @Input() disabledQuestionIds;
  @Output() diagnosticEmitter: EventEmitter<Diagnostic> = new EventEmitter<Diagnostic>();
  @Output() webSocDiagnosticEmitter: EventEmitter<Diagnostic> = new EventEmitter<Diagnostic>();
  @Output() themeChangeEmitter: EventEmitter<Number> = new EventEmitter<Number>();
  @Output() disabledQuestionIdsEmitter: EventEmitter<string[]> = new EventEmitter<string[]>();
  @HostListener('document:keydown', ['$event'])

  editor = null;
  constructor(private diagnosticService: DiagnosticService, private dialog: MatDialog, private ren: Renderer2) { }

  ngOnInit(): void {
    // Listen for changes from other users
    this.diagnosticService.onDiagnosticUpdate().subscribe((diagnostic) => {
      this.editor.updateContents(diagnostic);
      });
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' && this.isValidBack()) {
      this.back();
    }
    if (event.key === 'ArrowRight' && this.isValidNext()) {
      this.next();
    }
  }

  getUserData() {
    for (const userData of this.diagnostic.userData) {
      if (userData.userId === localStorage.getItem('diagnosticUser')) {
        return userData;
      }
    }
    return null;
  }

  getCurrentThemeId() {
    return this.getUserData().currentTheme;
  }

  getCurrentTheme() {
    return this.diagnostic.themes.find(theme => theme.id === this.getCurrentThemeId());
  }

  getCurrentFlattenedQuestions(): Question[] {
    return this.flattenedQuestionMap.get(this.getCurrentThemeId()).map(obj => obj.question);
  }

  getCurrentQuestion() {
    return this.getCurrentFlattenedQuestions().find(question => question.id === this.getCurrentQuestionId());
  }

  getCurrentQuestionId() {
    if (this.getCurrentFlattenedQuestions().length === 0) {
      return null;
    }
    return this.getUserData().currentQuestions[this.getCurrentThemeId()];
  }

  getResponses() {
    return this.getUserData().responses;
  }

  getCurrentResponse() {
    if (!this.getResponses()[this.getCurrentQuestionId()]) {
      this.getResponses()[this.getCurrentQuestionId()] = new Response();
    }
    return this.getResponses()[this.getCurrentQuestionId()];
  }

  getCurrentAnswer() {
    const currentAnswerId = this.getCurrentResponse().answerId;
    return this.getCurrentQuestion().answers.find(answer => answer.id === currentAnswerId);
  }

  isValidBack() {
    const firstTheme = this.diagnostic.themes[0];

    if (!firstTheme) {
      return false;
    }
    const firstQuestion = this.getCurrentFlattenedQuestions()[0];

    if (firstTheme.id === this.getCurrentThemeId() && (!firstQuestion || firstQuestion.id === this.getCurrentQuestionId())) {
      return false;
    } else {
      return true;
    }
  }

  isValidNext() {
    const lastTheme = this.diagnostic.themes[this.diagnostic.themes.length - 1];

    if (!lastTheme) {
      return false;
    }
    const lastQuestion = this.getCurrentFlattenedQuestions()[this.getCurrentFlattenedQuestions().length - 1];

    if (lastTheme.id === this.getCurrentThemeId() && (!lastQuestion || lastQuestion.id === this.getCurrentQuestionId())) {
      return false;
    } else {
      return true;
    }
  }

  back() {
    const flatThemeQuestionsArray = this.flattenedQuestionMap.get(this.getCurrentThemeId()).map(obj => obj['question']);
    const currentQuestionIndex = flatThemeQuestionsArray.findIndex(question => question.id === this.getCurrentQuestionId());

    if (currentQuestionIndex === 0 && this.isValidBack()) {
      const currentThemeIndex = this.diagnostic.themes.findIndex(theme => theme.id === this.getCurrentThemeId());
      const prevTheme = this.diagnostic.themes[currentThemeIndex - 1];
      this.getUserData().currentTheme = prevTheme.id;

      const prevThemeQuestions = this.getCurrentFlattenedQuestions();
      let questionId = prevThemeQuestions.length > 0 ? prevThemeQuestions[prevThemeQuestions.length - 1].id : '';

      if (this.disabledQuestionIds.findIndex(id => id === questionId)) {
        for (let i = prevThemeQuestions.length - 1; i >= 0; i--) {
          // If the current question is not in the disabled question ids, assign this as the new question id
          if (this.disabledQuestionIds.findIndex(id => id === prevThemeQuestions[i].id) === -1) {
            questionId = prevThemeQuestions[i].id;
            break;
          }
        }
      }

      this.getUserData().currentQuestions[prevTheme.id] = questionId;
      this.diagnosticEmitter.emit(this.diagnostic);
    } else {

      for (let i = currentQuestionIndex - 1; i >= 0; i--) {
        const previousQuestionId = flatThemeQuestionsArray[i].id;
        if (this.disabledQuestionIds.find(id => previousQuestionId === id) === undefined) {
          this.getUserData().currentQuestions[this.getCurrentThemeId()] = previousQuestionId;
          this.diagnosticEmitter.emit(this.diagnostic);
          return;
        }
      }
    }
  }

  next() {
    const flatThemeQuestionsArray = this.flattenedQuestionMap.get(this.getCurrentThemeId()).map(obj => obj['question']);
    const currentQuestionIndex = flatThemeQuestionsArray.findIndex(question => question.id === this.getCurrentQuestionId());
    const currentThemeIndex = this.diagnostic.themes.findIndex(theme => theme.id === this.getCurrentThemeId());
    const nextTheme = this.diagnostic.themes[currentThemeIndex + 1];

    if (currentQuestionIndex === flatThemeQuestionsArray.length - 1 && this.isValidNext()) {
      this.getUserData().currentTheme = nextTheme.id;

      const nextThemeQuestions = this.getCurrentFlattenedQuestions();
      const questionId = nextThemeQuestions.length > 0 ? nextThemeQuestions[0].id : '';

      this.getUserData().currentQuestions[nextTheme.id] = questionId;
      this.diagnosticEmitter.emit(this.diagnostic);
    } else {
      for (let i = currentQuestionIndex + 1; i < flatThemeQuestionsArray.length; i++) {
        const nextQuestionId = flatThemeQuestionsArray[i].id;
        if (this.disabledQuestionIds.find(id => nextQuestionId === id) === undefined) {
          this.getUserData().currentQuestions[this.getCurrentThemeId()] = nextQuestionId;
          this.diagnosticEmitter.emit(this.diagnostic);
          return;
        }
      }
      // This clause triggers if there's no id found in the currentTheme,
      // then we go to the next theme and set that theme's first question as next

      this.getUserData().currentTheme = nextTheme.id;
      const firstQuestionId = nextTheme.questions.length > 0 ? nextTheme.questions[0].id : 0;
      this.getUserData().currentQuestions[this.getCurrentThemeId()] = firstQuestionId;
      this.diagnosticEmitter.emit(this.diagnostic);
    }
  }

  isDiagnosticEmpty() {
    if (this.diagnostic.themes.length === 0) {
      return true;
    }

    for (const theme of this.diagnostic.themes) {
      if (theme.visible) {
        return false;
      }
    }

    return true;
  }

  selectAnswerOption(answer, el) {
    setTimeout(() => {
      const currentAnswer = this.getCurrentAnswer();

      const flattenedQuestions = this.getCurrentFlattenedQuestions();
      const currentIndex = flattenedQuestions.findIndex(question => question.id === this.getCurrentQuestionId());

      // Don't need to handle disabledQuestions logic
      if (currentIndex === flattenedQuestions.length - 1) {

      } else {
        let newNextId;

        // When a previously selected answer is deselected
        if (currentAnswer && currentAnswer.id === el.value) {
          newNextId = flattenedQuestions[currentIndex + 1];
        } else {
          newNextId = answer.next === '' ? flattenedQuestions[currentIndex + 1].id : answer.next;
        }

        let previousNextIdIndex;

        if (currentAnswer) {
          const previousNextId = currentAnswer.next === '' ? flattenedQuestions[currentIndex + 1].id : currentAnswer.next;

          if (previousNextId !== 'nextTheme') {
            previousNextIdIndex = flattenedQuestions.findIndex(question => question.id === previousNextId);
          } else {
            previousNextIdIndex = flattenedQuestions.length;
          }
        } else {
          previousNextIdIndex = currentIndex + 1;
        }

        let newNextIdIndex;

        if (newNextId !== 'nextTheme') {
          newNextIdIndex = flattenedQuestions.findIndex(question => question.id === newNextId);
        } else {
          newNextIdIndex = flattenedQuestions.length;
        }

        if (previousNextIdIndex > newNextIdIndex) {
          for (let i = newNextIdIndex; i <= previousNextIdIndex; i++) {
            const theId = flattenedQuestions[i] ? flattenedQuestions[i].id : '';
            const indexToRemove = this.disabledQuestionIds.findIndex(id => id === theId);
            if (indexToRemove !== -1) {
              this.disabledQuestionIds.splice(indexToRemove, 1);
            }
          }
        }

        if (previousNextIdIndex < newNextIdIndex) {
          for (let i = Math.max(0, previousNextIdIndex); i < newNextIdIndex; i++) {
            this.disabledQuestionIds.push(flattenedQuestions[i].id);
          }
        }

        this.disabledQuestionIdsEmitter.emit(this.disabledQuestionIds);
      }

      // If an answer is being deselected
      if (currentAnswer && currentAnswer.id === el.value) {
        this.getCurrentResponse().answerId = '';
        el.checked = false;
        this.ren.removeClass(el['_elementRef'].nativeElement, 'cdk-focused');
        this.ren.removeClass(el['_elementRef'].nativeElement, 'cdk-program-focused');
      } else {
        this.getCurrentResponse().answerId = answer.id;
      }

      this.diagnosticEmitter.emit(this.diagnostic);
    });
  }

  updateNote(notes) {
    this.getCurrentResponse().notes = notes;
    this.diagnosticEmitter.emit(this.diagnostic);
  }

  ignoreArrowKeys(event) {
    if (event.keyCode === 37 || event.keyCode === 39) {
      event.stopPropagation();
    }
  }

  openQuestionDescription(description: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: description,
    });
  }

  editorInit(editor) {
    this.editor = editor;
  }

  focusEditor($event) {
    this.editor.focus();
  }

  onContentChanged(notes) {
    this.getCurrentResponse().notes = notes;
    this.webSocDiagnosticEmitter.emit(this.diagnostic);
  }
}
