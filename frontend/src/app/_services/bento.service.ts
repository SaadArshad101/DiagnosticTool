import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class BentoService {

  constructor() { }

  // Returns an array where there are as many entries as there are questions in a theme.
  // A '0' value maps to X axis and a '1' value maps to Y axis.
  // Errors if the description does not map exactly to either Mission Criticality or Technical Health.
  getAxisIndices(diagnostic): number[] {
    const axisIndices = [];

    for (const question of diagnostic.themes[0].questions) {
      if (question.description === '<p>Mission Criticality</p>') {
        axisIndices.push(0);
      } else if (question.description === '<p>Technical Health</p>') {
        axisIndices.push(1);
      } else {
        console.log(question.description);
        alert('A question description on a question did not match X/Y axis description criteria');
        return;
      }
    }

   return axisIndices;
  }

  convertStringArrayToStr(arr: string[]) {
    let str = '[';

    for (const element of arr) {
      str += (' \'' + element + '\',');
    }

    // This is to remove the last comma from the string
    if (str.length > 1) {
      str = str.substr(0, str.length - 1);
    }

    str += '];';

    return str;
  }

  convert2DNumberArrayToStr(arr: number[][]) {
    let str = '[\n';

    for (const numArr of arr) {
      str += '[';
      for (const num of numArr) {
        str += num + ',';
      }
      // This is to remove the last comma if there is one
      if (str.substr(-1) === ',') {
        str = str.substr(0, str.length - 1);
      }
      str += '],\n';
    }

    // This is to remove the last comma and new line
    if (str.substr(str.length - 2) === ',\n') {
      str = str.substr(0, str.length - 2);
    }
    str += '];';

    return str;
  }

  exportBento(diagnostic, userData) {
    let bentoString = '';

    // appNames
    bentoString += 'var appNames = ';
    const appNames: string[] = [];
    for (const theme of diagnostic.themes) {
      appNames.push(theme.title);
    }
    bentoString += this.convertStringArrayToStr(appNames);

    // appShortNames
    bentoString += '\n\nvar appShortNames = ';
    const appShortNames = appNames;
    bentoString += this.convertStringArrayToStr(appShortNames);

    // appCnt
    bentoString += '\n\nvar appCnt = ';
    bentoString += diagnostic.themes.length + ';';

    // varShortNames. This assumes that all the themes has the same question, so we just get questions from the first theme
    bentoString += '\n\nvar varShortNames = [ \'Impact if System Unavailable\', \'Mission Alignment\', \'Number of Users\', \'Processes Supported\', \'Stakeholders Supported\', \'Capabilities Provided\', \'Security Vulnerabilities\', \'Architecture and Design compliance\', \'Disaster Recovery\', \'Statutory Compliance\', \'Sustainment Cost\', \'Cloud Readiness\'];';

    // Initializations
    bentoString += '\n\nvar chosenCatOptionX = [];\nvar chosenCatOptionY = [];\nvar chosenConValueX = [];\nvar chosenConValueY = [];';

    // chosenCatOptions_orig
    const options = this.getChosenCatOptions(diagnostic, userData);
    const xOptions = options[0];
    const yOptions = options[1];

    // chosenCatOptionX_orig
    bentoString += '\n\nvar chosenCatOptionX_orig = ';
    bentoString += this.convert2DNumberArrayToStr(xOptions);

    // chosenCatOptionY_orig
    bentoString += '\n\nvar chosenCatOptionY_orig = ';
    bentoString += this.convert2DNumberArrayToStr(yOptions);

    // create 2d array of length themes.length with empty arrays at the 2nd level
    const empty2Darray = [];
    for (const theme of diagnostic.themes) {
      empty2Darray.push([]);
    }

    // chosenConValueX_orig
    bentoString += '\n\nvar chosenConValueX_orig = ';
    bentoString += this.convert2DNumberArrayToStr(empty2Darray);

    // chosenConValueY_orig
    bentoString += '\n\nvar chosenConValueY_orig = ';
    bentoString += this.convert2DNumberArrayToStr(empty2Darray);

    const file = new Blob([bentoString], {type: 'application/javascript'});
    saveAs(file, diagnostic.title + '.js');
  }

  // Returns an array with 2 elements, first element is a 2D array of all the responses from the X axis
  // second element is a 2D array of the all the responses from the Y axis
  getChosenCatOptions(diagnostic, userData): number[][][] {
    const axisIndices = this.getAxisIndices(diagnostic);
    const chosenCatOptionsX: number[][] = [];
    const chosenCatOptionsY: number[][] = [];

    for (let i = 0; i < userData.responses.length; i++) {
      chosenCatOptionsX.push([]);
      chosenCatOptionsY.push([]);

      for (let j = 0; j < userData.responses[i].length; j++) {
        if (axisIndices[j] === 0) {
          chosenCatOptionsX[i].push(userData.responses[i][j].value);
        } else if (axisIndices[j] === 1) {
          chosenCatOptionsY[i].push(userData.responses[i][j].value);
        } else {
          alert('Something went wrong in classifying what questions belong to what axis');
          return;
        }
      }
    }

    return [chosenCatOptionsX, chosenCatOptionsY];
  }
}
