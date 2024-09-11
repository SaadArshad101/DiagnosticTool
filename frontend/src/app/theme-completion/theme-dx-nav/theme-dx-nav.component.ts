import { Component, Input, Output, ElementRef, EventEmitter, Renderer2 } from '@angular/core';
import { Question, Theme } from 'src/app/_models/http_resource';

@Component({
  selector: 'app-theme-dx-nav',
  templateUrl: './theme-dx-nav.component.html',
  styleUrls: ['./theme-dx-nav.component.css']
})

export class ThemeDXNavComponent {

  @Input() diagnostic;
  @Input() flattenedQuestionMap;
  @Input() disabledQuestionIds;

  @Output() themeIdEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() reportClickedEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() questionEmitter: EventEmitter<Question> = new EventEmitter<Question>();

  constructor() { }

  setCurrentTheme(id) {
    this.themeIdEmitter.emit(id);
  }

  getCurrentTheme(): Theme {
    return this.diagnostic.themes.find(theme => theme.id === this.getCurrentThemeId());
  }

  selectQuestion(question: Question) {
    if (!this.isQuestionDisabled(question.id)) {
      this.questionEmitter.emit(question);
    }
  }

  getFlattenedObjectsOfTheme(theme) {
    return this.flattenedQuestionMap.get(theme.id);
  }

  isQuestionCompleted(question: Question) {
    const response = this.getResponse(question.id);

    if (response === undefined) {
      return false;
    } else {
      if (question.answers.length === 0) {
        return response['notes'];
      } else {
        return response['answerId'] !== null && response['answerId'] !== '';
      }
    }
  }

  isQuestionCurrent(id: string) {
    return id === this.getCurrentQuestionId();
  }

  isQuestionDisabled(id: string) {
    return this.disabledQuestionIds.findIndex(i => i === id) > -1;
  }

  getResponse(id: string): Response {
    return this.getUserData().responses[id];
  }

  getCurrentQuestion() {
    return this.getUserData().currentQuestions[this.getCurrentQuestionId()];
  }

  getCurrentQuestionId(): string {
    return this.getUserData().currentQuestions[this.getCurrentThemeId()];
  }

  getCurrentThemeId(): string {
    return this.getUserData().currentTheme;
  }

  getUserData() {
    for (const userData of this.diagnostic.userData) {
      if (userData.userId === localStorage.getItem('diagnosticUser')) {
        return userData;
      }
    }
    return null;
  }
}
