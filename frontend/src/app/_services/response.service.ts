import { Injectable } from '@angular/core';
import { Diagnostic, Theme, Question, Answer } from '../_models/http_resource';

@Injectable({
  providedIn: 'root'
})
export class ResponseService {

  constructor() { }

  getFlattenQuestionsMap(diagnostic: Diagnostic) {
    const flattenedQuestionMap = new Map<string, Object[]>();
    for (const theme of diagnostic.themes) {
      if (theme.visible) {
        flattenedQuestionMap.set(theme.id, this.flattenQuestionsArrayForTheme(theme));
      }
    }

    return flattenedQuestionMap;
  }

  flattenQuestionsArrayForTheme(theme: Theme): Object[] {

    const flatArray = [];
    const stack = [];
    const depthCount = new Map<number, number>();
    stack.push(JSON.parse(JSON.stringify(theme.questions)));

    while (stack.length > 0) {
      let topArray = stack[stack.length - 1];
      const firstElement: Question = {... topArray[0]};

      topArray.shift();

      // Following code is to generate numbering of a question: I.E. 1.1.2 for 1st question's 1st child's 2nd child
      const currentDepthCount = depthCount.get(stack.length) ? depthCount.get(stack.length) : 0;
      depthCount.set(stack.length, currentDepthCount + 1);

      let numbering = '';
      for (let i = 1; i <= stack.length; i++) {
        numbering += depthCount.get(i) + '.';
      }

      // Remove trailing '.' from subquestions
      if (stack.length > 1) {
        numbering = numbering.substring(0, numbering.length - 1);
      }

      flatArray.push({
        'question': firstElement,
        'depth': stack.length,
        'numbering': numbering});

      if (firstElement && firstElement.children && firstElement.children.length > 0) {
        stack.push(firstElement.children);
      } else if (topArray.length <= 0) {
        while (stack.length > 0 && topArray.length <= 0) {
          stack.pop();
          topArray = stack[stack.length - 1];
        }
      }
    }

    return flatArray;
  }

  getDisabledQuestions(diagnostic, flattenedQuestionMap, userData) {
    const disabledQuestionIds = [];

    for (let i = 0; i < diagnostic.themes.length; i++) {
      const theme = diagnostic.themes[i];
      // Get the flattened questions from the map by extracting the question element from object
      const questions = flattenedQuestionMap.get(theme.id).map(object => object['question']);

      for (let j = 0; j < questions.length; j++) {
        const question = questions[j];
        if (!userData.responses[question.id]) {
          break;
        }

        const answerId = userData.responses[question.id].answerId;
        const answer = this.getAnswerFromId(question, answerId);
        if (answer !== undefined && answer.next !== '') {
          let count = j + 1;
          let currentQuestionId = questions[count] ? questions[count].id : '';

          let idExists;
          if (answer.next === 'nextTheme') {
            idExists = true;
          } else {
            idExists = questions.findIndex(q => q.id === answer.next) !== -1;
          }

          while (idExists && currentQuestionId !== answer.next) {
            disabledQuestionIds.push(currentQuestionId);
            count++;

            if (count >= questions.length) {
              // This should only happen when currentQuestionId is 'nextTheme' and basically this is to exit the loop after adding
              // all the rest of the question ids to the disabledQuestionIds
              break;
            } else {
              currentQuestionId = questions[count].id;
            }
          }
        }
      }

      return disabledQuestionIds;
    }

    return disabledQuestionIds;
  }

  getAnswerFromId(question: Question, id: string): Answer {
    return question.answers.find(answer => answer.id === id);
  }
}
