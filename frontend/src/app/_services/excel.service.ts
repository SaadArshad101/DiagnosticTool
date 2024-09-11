import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Question, Answer, Theme, Diagnostic, Rubric, Capability, Tag } from '../_models/http_resource';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  public importFromXLSX(file): Promise<Diagnostic> {

    const themeSheets: XLSX.WorkSheet[] = [];
    let roadmapSheet: XLSX.WorkSheet = null;
    let considerationSheet: XLSX.WorkSheet = null;
    let diagnosticSheet: XLSX.WorkSheet = null;
    let themeInfoSheet: XLSX.WorkSheet = null;

    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException('Problem parsing input file'));
      };

      reader.onloadend = (e) => {
        /* read workbook */
        const bstr = reader.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

        const wsnames: string[] = wb.SheetNames;
        for (let i = 0; i < wsnames.length; i++) {
          const wsname = wsnames[i];

          if (wsname === 'Implementation Roadmap') {
            roadmapSheet = wb.Sheets[wsname];
          } else if (wsname === 'Strategic Considerations') {
            considerationSheet = wb.Sheets[wsname];
          } else if (wsname === 'Diagnostic Info') {
            diagnosticSheet = wb.Sheets[wsname];
          } else if (wsname === 'Recommendations') {
            // This needs to be done when recommendation inventory feature is created.
          } else if (wsname === 'Theme Info') {
            themeInfoSheet = wb.Sheets[wsname];
          } else {
            themeSheets.push(wb.Sheets[wsname]);
          }
        }

        const diagnostic = new Diagnostic();

        // Set these to empty rather than the default value of array with 1 element each
        diagnostic.themes = [];
        diagnostic.rubric = [];

        for (const sheet of themeSheets) {
          diagnostic.themes.push(this.convertSheetToTheme(sheet, diagnostic));
        }

        // Set up roadmap to be Ax4 where A is the number of themes
        diagnostic.roadmap = [];
        for (const theme of diagnostic.themes) {
          diagnostic.roadmap.push(['', '', '', '']);
        }

        if (roadmapSheet) {
          this.getRoadMap(roadmapSheet, diagnostic.roadmap);
        }
        if (diagnosticSheet) {
          this.getDiagnosticInfo(diagnosticSheet, diagnostic);
        }
        if (themeInfoSheet) {
          this.getThemeMetadata(themeInfoSheet, diagnostic);
        }
        if (considerationSheet) {
          diagnostic.rubric = this.getConsiderations(considerationSheet);
        }

        resolve(diagnostic);
      };
      reader.readAsBinaryString(file);
    });
  }

  public getThemeMetadata(sheet: XLSX.Sheet, diagnostic: Diagnostic) {
    let currentRow = 2;
    for (const theme of diagnostic.themes) {
      if (sheet['C' + currentRow]) {
        theme.benefitsAndOutcomes = sheet['C' + currentRow].v;
      }
      currentRow++;
    }
  }

  public getDiagnosticInfo(infoSheet: XLSX.Sheet, diagnostic: Diagnostic) {
    diagnostic.title =  infoSheet['B1'] ? infoSheet['B1'].v : '';
    diagnostic.text = infoSheet['B2'] ? infoSheet['B2'].v : '';
  }

  public getRoadMap(roadmapSheet: XLSX.Sheet, roadmap: string[][]) {
    if (roadmapSheet === null) {
      return;
    }

    // We expect the first row to be on row 2 and the first col to be 3 or 'C' at the start. Column is zero indexed
    const startRow = 2;
    const startCol = 2;

    // We loop through the A x 4 table where A is the number of themes. These are all the considerations
    for (let i = 0; i < roadmap.length; i++) {
      for (let j = 0; j < 4; j++) {
        const cell = roadmapSheet[this.convertNumToColumnName(startCol + j) + (startRow + i)];
        if (cell !== undefined) {
          roadmap[i][j] = cell.v;
        }
      }
    }
  }

  public getConsiderations(considerationSheet: XLSX.Sheet): Rubric[] {
    const considerations = [];

    if (considerationSheet === null) {
      return [];
    }

    // We expect the first row to be on row 2 and the first col to be 2 or 'B' at the start. Column is zero indexed
    let currentRow = 2;
    const startCol = 1;

    // This is the first cell in the row that we are retrieving cell data from
    let currentCell = considerationSheet[this.convertNumToColumnName(startCol) + currentRow];

    while (currentCell !== undefined) {
      const rubric = new Rubric();

      // Get the title of the consideration
      currentCell = considerationSheet[this.convertNumToColumnName(startCol) + currentRow];

      if (currentCell !== undefined) {
        rubric.title = currentCell.v;
      }

      // Get the description of the consideration
      currentCell = considerationSheet[this.convertNumToColumnName(startCol + 1) + currentRow];

      if (currentCell !== undefined) {
        rubric.text = currentCell.v;
      }

      // Get the min, max values of the consideration
      currentCell = considerationSheet[this.convertNumToColumnName(startCol + 2) + currentRow];

      if (currentCell !== undefined) {
        rubric.min = currentCell.v;
      }

      currentCell = considerationSheet[this.convertNumToColumnName(startCol + 3) + currentRow];

      if (currentCell !== undefined) {
        rubric.max = currentCell.v;
      }

      // Get the type and entity
      currentCell = considerationSheet[this.convertNumToColumnName(startCol + 4) + currentRow];

      if (currentCell !== undefined) {
        rubric.level = currentCell.v;
      }

      currentCell = considerationSheet[this.convertNumToColumnName(startCol + 5) + currentRow];

      if (currentCell !== undefined) {
        rubric.entity = currentCell.v;
      }

      // Move onto the next row and update vars
      currentRow++;
      currentCell = considerationSheet[this.convertNumToColumnName(startCol) + currentRow];
      considerations.push(rubric);
    }

    return considerations;
  }

  public convertSheetToTheme(sheet: XLSX.Sheet, diagnostic: Diagnostic) {
    const themeTitle = sheet.B2.v;
    const themeProcessId = sheet.A2.v;
    const theme = new Theme();

    theme.coreProcessId = themeProcessId;
    theme.title = themeTitle;

    let row = 2;
    let question = this.getQuestionFromRow(sheet, row, diagnostic);

    while (question !== null) {
      row++;
      theme.questions.push(question);
      question = this.getQuestionFromRow(sheet, row, diagnostic);
    }

    return theme;
  }

  public getQuestionFromRow(sheet: XLSX.Sheet, row: number, diagnostic: Diagnostic): Question {
    // BIG RISK: If someone changes the content in the template, this method is going to fail because this expects rigid positioning.

    // There are no more questions to pull in
    if (sheet['C' + row] === undefined) {
      return null;
    }

    // Get capabilities
    const capabilityId = sheet['C' + row].v;
    const capabilityNames = sheet['D' + row].v.split(';');
    const tags = [];

    capabilityNames.forEach(element => {
      const tag = new Tag();
      tag.value = element;
      tag.capabilityId = capabilityId;

      tags.push({'display': tag.value, 'value': tag.value});
      diagnostic.tags.push(tag);
    });

    // Filter out any duplicates
    this.filterDuplicateTags(diagnostic.tags);

    const question = new Question();
    question.text = sheet['E' + row].v;
    question.scorecardType = sheet['F' + row].v;
    question.answers = this.getAnswersFromRow(sheet, row);
    question.tags = tags;

    if (question.scorecardType !== "" && !isNaN(+question.scorecardType)) {
      question.scorecardType = diagnostic.inventory[question.scorecardType].name;
    }

    return question;
  }

  // This is to remove duplicate tag values from the diagnostic when importing tags
  filterDuplicateTags(tags: Tag[]) {
    tags.map(tag => tag.value);
    tags = Array.from(new Set(tags));
  }

  public getAnswersFromRow(sheet: XLSX.Sheet, row: number) {
    const answers: Answer[] = [];

    // The 7th column is where the first column that references an answer is
    let columnNum = 6;
    let answerTextCell = sheet[this.convertNumToColumnName(columnNum) + row];

    // Currently the first column is answer text, the column after that is answer value
    while (answerTextCell !== undefined) {
      const answer = new Answer();
      answer.text = answerTextCell.v;

      // Get answer value
      columnNum++;
      answer.value = sheet[this.convertNumToColumnName(columnNum) + row].v;

      answers.push(answer);

      // Go to the next answer
      columnNum++;
      answerTextCell = sheet[this.convertNumToColumnName(columnNum) + row];
    }

    return answers;
  }

  public convertNumToColumnName(num: number): string {
    const ordA = 'A'.charCodeAt(0);
    const ordZ = 'Z'.charCodeAt(0);
    const len = ordZ - ordA + 1;

    let s = '';
    while (num >= 0) {
        s = String.fromCharCode(num % len + ordA) + s;
        num = Math.floor(num / len) - 1;
    }
    return s;
  }
}
