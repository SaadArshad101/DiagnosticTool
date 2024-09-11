import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserDiagnosticData, Response, Theme, Question } from 'src/app/_models/http_resource';

@Component({
  selector: 'app-theme-question-nav',
  templateUrl: './theme-question-nav.component.html',
  styleUrls: ['./theme-question-nav.component.css']
})
export class ThemeQuestionNavComponent {

  @Input() diagnostic;
  @Input() flattenedQuestionMap;
  @Input() disabledQuestionIds;
  @Output() questionEmitter: EventEmitter<Question> = new EventEmitter<Question>();

  selectQuestion(question: Question) {
    if (!this.isQuestionDisabled(question.id)) {
      this.questionEmitter.emit(question);
    }
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

  calculatePercentageDone(): number {
    if (this.getFlattenedQuestions().length <= 0) {
      return 0;
    }

    let sum = 0;

    for (const question of this.getFlattenedQuestions()) {
      const response = this.getResponse(question.id);

      if (response && response.answerId) {
        sum++;
      }
    }

    return Math.round(100 * sum / this.getFlattenedQuestions().length);
  }

  getResponse(id: string): Response {
    return this.getUserData().responses[id];
  }

  getCurrentQuestionId(): string {
    return this.getUserData().currentQuestions[this.getCurrentThemeId()];
  }

  getCurrentThemeId(): string {
    return this.getUserData().currentTheme;
  }

  getCurrentTheme(): Theme {
    const currentThemeId = this.getUserData().currentTheme;

    if (currentThemeId === null || currentThemeId === undefined) {
      return this.diagnostic.themes[0];
    }
    return this.diagnostic.themes.find(theme => currentThemeId === theme.id);
  }

  getFlattenedQuestions(): Question[] {
    return this.flattenedQuestionMap.get(this.getCurrentThemeId()).map(obj => obj['question']);
  }

  getUserData(): UserDiagnosticData {
    for (const userData of this.diagnostic.userData) {
      if (userData.userId === localStorage.getItem('diagnosticUser')) {
        return userData;
      }
    }
    return null;
  }
}
