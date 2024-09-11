import { Injectable } from "@angular/core";
import { find } from "rxjs/operators";
import {
  Theme,
  Tag,
  UserDiagnosticData,
  Diagnostic,
  Scorecard,
  Capability,
  ScorecardQuestion,
} from "../_models/http_resource";

@Injectable({
  providedIn: "root",
})
export class ScorecardService {
  constructor() {}

  getAggregratedScorecards(diagnostic, flatMap) {
    const scorecards = [];

    for (
      let themeIndex = 0;
      themeIndex < diagnostic.themes.length;
      themeIndex++
    ) {
      this.getAggregateScorecardOfTheme(diagnostic, themeIndex, flatMap).then(
        (scorecard) => {
          if (scorecard === null) {
            scorecards.push(new Scorecard());
          } else {
            scorecards.push(scorecard);
          }
        }
      );
    }

    return scorecards;
  }

  getAggregateScorecardOfTheme(diagnostic, themeIndex, flatMap) {
    const scorecardsPromise = new Promise<Scorecard[]>((resolve, reject) => {
      resolve(
        this.getAllUserScorecardsOfTheme(diagnostic, themeIndex, flatMap)
      );
    });

    return scorecardsPromise.then((scorecards) => {
      if (scorecards.length === 0) {
        return null;
      }

      // We'll change the fields that need to be changed and keep the ones that don't
      const aggregateScorecard = scorecards[0];

      const themeScores: number[] = [];
      const capabilityScores: number[][] = [];
      const processFindings: string[][] = [];
      const peopleFindings: string[][] = [];
      const technologyFindings: string[][] = [];
      const userAddedFindings1: string[][] = [];
      const userAddedFindings2: string[][] = [];
      const userAddedFindings3: string[][] = [];
      const userAddedFindings4: string[][] = [];
      const keyEvidence = [];

      // Adding an empty array for each capability and question (for keyEvidence)
      aggregateScorecard.capabilities.forEach((capability) => {
        capabilityScores.push([]);
        keyEvidence.push([]);
      });

      for (const scorecard of scorecards) {
        themeScores.push(scorecard.maturity);
        capabilityScores.push([]);

        if (scorecard.processFindings && scorecard.processFindings.length > 0) {
          processFindings.push(scorecard.processFindingsArray);
        }
        if (scorecard.peopleFindings && scorecard.peopleFindings.length > 0) {
          peopleFindings.push(scorecard.peopleFindingsArray);
        }
        if (
          scorecard.technologyFindings &&
          scorecard.technologyFindings.length > 0
        ) {
          technologyFindings.push(scorecard.technologyFindingsArray);
        }
        if (
          scorecard.userAddedFindings1 &&
          scorecard.userAddedFindings1.length > 0
        ) {
          userAddedFindings1.push(scorecard.userAddedFindingsArray1);
        }
        if (
          scorecard.userAddedFindings2 &&
          scorecard.userAddedFindings2.length > 0
        ) {
          userAddedFindings2.push(scorecard.userAddedFindingsArray2);
        }
        if (
          scorecard.userAddedFindings3 &&
          scorecard.userAddedFindings3.length > 0
        ) {
          userAddedFindings3.push(scorecard.userAddedFindingsArray3);
        }
        if (
          scorecard.userAddedFindings4 &&
          scorecard.userAddedFindings4.length > 0
        ) {
          userAddedFindings4.push(scorecard.userAddedFindingsArray4);
        }

        let count = 0;

        for (const capability of scorecard.capabilities) {
          capabilityScores[count].push(capability.maturity);
          keyEvidence[count].push(capability.keyEvidenceArray);
          count++;
        }
      }

      // Averaging maturities
      aggregateScorecard.maturity = this.getAverageOfArray(themeScores);

      for (let i = 0; i < aggregateScorecard.capabilities.length; i++) {
        aggregateScorecard.capabilities[i].maturity = this.getAverageOfArray(
          capabilityScores[i]
        );
      }

      // Flatten findings arrays and keyEvidence arrays and remove duplicates. All new arrays are flattened by a depth of 1
      aggregateScorecard.processFindings = this.convertListToListInHTML(
        this.filterDuplicateItemsFromArray(processFindings.flat())
      );
      aggregateScorecard.peopleFindings = this.convertListToListInHTML(
        this.filterDuplicateItemsFromArray(peopleFindings.flat())
      );
      aggregateScorecard.technologyFindings = this.convertListToListInHTML(
        this.filterDuplicateItemsFromArray(technologyFindings.flat())
      );
      aggregateScorecard.userAddedFindings1 = this.convertListToListInHTML(
        this.filterDuplicateItemsFromArray(userAddedFindings1.flat())
      );
      aggregateScorecard.userAddedFindings2 = this.convertListToListInHTML(
        this.filterDuplicateItemsFromArray(userAddedFindings2.flat())
      );
      aggregateScorecard.userAddedFindings3 = this.convertListToListInHTML(
        this.filterDuplicateItemsFromArray(userAddedFindings3.flat())
      );
      aggregateScorecard.userAddedFindings4 = this.convertListToListInHTML(
        this.filterDuplicateItemsFromArray(userAddedFindings4.flat())
      );

      for (let i = 0; i < aggregateScorecard.capabilities.length; i++) {
        aggregateScorecard.capabilities[i].keyEvidence =
          this.convertListToListInHTML(
            this.filterDuplicateItemsFromArray(keyEvidence[i].flat())
          );
        // this.updateMaturity(aggregateScorecard.capabilities[i]);
      }

      return aggregateScorecard;
    });
  }

  updateMaturity(capability) {
    let index = Math.floor(capability.maturity / 25);

    capability.questions.forEach((q) => {
      q.chosenAnswer = q.harveyBallText[index];
    });
  }

  convertListToListInHTML(list: string[]) {
    if (list === undefined || list.length === 0) {
      return "";
    }
    let htmlList = "<ul>";
    for (const ele of list) {
      if (ele !== null) {
        const li = "<li>" + ele + "</li>";
        htmlList += li;
      }
    }
    htmlList += "</ul>";

    return htmlList;
  }

  getAllUserScorecardsOfTheme(diagnostic, themeIndex, flatMap) {
    const scorecards = [];

    for (const userData of diagnostic.userData) {
      scorecards.push(
        this.getScorecardOfTheme(diagnostic, themeIndex, userData, flatMap)
      );
    }

    return scorecards;
  }

  getAverageOfArray(arr) {
    let sum = 0;

    for (const element of arr) {
      if (element !== undefined) {
        sum += +element;
      }
    }

    return sum / arr.length;
  }

  // Also remove null elements
  filterDuplicateItemsFromArray(arr: string[]): string[] {
    if (arr !== undefined) {
      const unique = Array.from(new Set(arr.filter((ele) => ele != null)));
      return unique;
    }
    return [];
  }

  getScorecardOfTheme(
    diagnostic: Diagnostic,
    themeIndex: number,
    userData,
    flatMap
  ) {
    const scorecard = new Scorecard();
    const theme = diagnostic.themes[themeIndex];
    const percentages = this.getCapabilityPercentagesInTheme(
      diagnostic,
      themeIndex,
      userData,
      flatMap
    );

    const arr = this.getKeyEvidenceAndFindingsAndQuestionMetadataOfCapability(
      diagnostic,
      themeIndex,
      userData,
      flatMap
    );
    const keyEvidence = arr[0];
    const findings = arr[1] as Map<string, string[]>;
    const scorecardQuestions = arr[2];

    scorecard.coreProcess = theme.title;
    scorecard.coreProcessId = (themeIndex + 1).toString();
    scorecard.maturity = this.getAverageScoreOfTheme(
      diagnostic,
      themeIndex,
      userData,
      flatMap
    );
    scorecard.benefitsAndOutcomes = theme.benefitsAndOutcomes;

    // get number of findings
    const numOfFindings = diagnostic.inventory.length;

    // switch based on the number of findings (THIS NEEDS TO BE REFACTORED WHEN POSSIBLE - NOT EFFICIENT)
    // to refactor we will need to change the way we are storing findings - not as separate attributes but an array
    switch (numOfFindings) {
      case 1:
        scorecard.peopleFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[0].name) as string[]
        );
        scorecard.peopleFindingsArray = findings.get(
          diagnostic.inventory[0].name
        ) as string[];
        break;
      case 2:
        scorecard.peopleFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[0].name) as string[]
        );
        scorecard.peopleFindingsArray = findings.get(
          diagnostic.inventory[0].name
        ) as string[];
        scorecard.processFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[1].name) as string[]
        );
        scorecard.processFindingsArray = findings.get(
          diagnostic.inventory[1].name
        ) as string[];
        break;
      case 3:
        scorecard.peopleFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[0].name) as string[]
        );
        scorecard.peopleFindingsArray = findings.get(
          diagnostic.inventory[0].name
        ) as string[];
        scorecard.processFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[1].name) as string[]
        );
        scorecard.processFindingsArray = findings.get(
          diagnostic.inventory[1].name
        ) as string[];
        scorecard.technologyFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[2].name) as string[]
        );
        scorecard.technologyFindingsArray = findings.get(
          diagnostic.inventory[2].name
        ) as string[];
        break;
      case 4:
        scorecard.peopleFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[0].name) as string[]
        );
        scorecard.peopleFindingsArray = findings.get(
          diagnostic.inventory[0].name
        ) as string[];
        scorecard.processFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[1].name) as string[]
        );
        scorecard.processFindingsArray = findings.get(
          diagnostic.inventory[1].name
        ) as string[];
        scorecard.technologyFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[2].name) as string[]
        );
        scorecard.technologyFindingsArray = findings.get(
          diagnostic.inventory[2].name
        ) as string[];
        scorecard.userAddedFindings1 = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[3].name) as string[]
        );
        scorecard.userAddedFindingsArray1 = findings.get(
          diagnostic.inventory[3].name
        ) as string[];
        break;
      case 5:
        scorecard.peopleFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[0].name) as string[]
        );
        scorecard.peopleFindingsArray = findings.get(
          diagnostic.inventory[0].name
        ) as string[];
        scorecard.processFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[1].name) as string[]
        );
        scorecard.processFindingsArray = findings.get(
          diagnostic.inventory[1].name
        ) as string[];
        scorecard.technologyFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[2].name) as string[]
        );
        scorecard.technologyFindingsArray = findings.get(
          diagnostic.inventory[2].name
        ) as string[];
        scorecard.userAddedFindings1 = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[3].name) as string[]
        );
        scorecard.userAddedFindingsArray1 = findings.get(
          diagnostic.inventory[3].name
        ) as string[];
        scorecard.userAddedFindings2 = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[4].name) as string[]
        );
        scorecard.userAddedFindingsArray2 = findings.get(
          diagnostic.inventory[4].name
        ) as string[];
        break;
      case 6:
        scorecard.peopleFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[0].name) as string[]
        );
        scorecard.peopleFindingsArray = findings.get(
          diagnostic.inventory[0].name
        ) as string[];
        scorecard.processFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[1].name) as string[]
        );
        scorecard.processFindingsArray = findings.get(
          diagnostic.inventory[1].name
        ) as string[];
        scorecard.technologyFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[2].name) as string[]
        );
        scorecard.technologyFindingsArray = findings.get(
          diagnostic.inventory[2].name
        ) as string[];
        scorecard.userAddedFindings1 = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[3].name) as string[]
        );
        scorecard.userAddedFindingsArray1 = findings.get(
          diagnostic.inventory[3].name
        ) as string[];
        scorecard.userAddedFindings2 = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[4].name) as string[]
        );
        scorecard.userAddedFindingsArray2 = findings.get(
          diagnostic.inventory[4].name
        ) as string[];
        scorecard.userAddedFindings3 = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[5].name) as string[]
        );
        scorecard.userAddedFindingsArray3 = findings.get(
          diagnostic.inventory[5].name
        ) as string[];
        break;
      case 7:
        scorecard.peopleFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[0].name) as string[]
        );
        scorecard.peopleFindingsArray = findings.get(
          diagnostic.inventory[0].name
        ) as string[];
        scorecard.processFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[1].name) as string[]
        );
        scorecard.processFindingsArray = findings.get(
          diagnostic.inventory[1].name
        ) as string[];
        scorecard.technologyFindings = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[2].name) as string[]
        );
        scorecard.technologyFindingsArray = findings.get(
          diagnostic.inventory[2].name
        ) as string[];
        scorecard.userAddedFindings1 = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[3].name) as string[]
        );
        scorecard.userAddedFindingsArray1 = findings.get(
          diagnostic.inventory[3].name
        ) as string[];
        scorecard.userAddedFindings2 = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[4].name) as string[]
        );
        scorecard.userAddedFindingsArray2 = findings.get(
          diagnostic.inventory[4].name
        ) as string[];
        scorecard.userAddedFindings3 = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[5].name) as string[]
        );
        scorecard.userAddedFindingsArray3 = findings.get(
          diagnostic.inventory[5].name
        ) as string[];
        scorecard.userAddedFindings4 = this.convertListToListInHTML(
          findings.get(diagnostic.inventory[6].name) as string[]
        );
        scorecard.userAddedFindingsArray4 = findings.get(
          diagnostic.inventory[6].name
        ) as string[];
        break;
    }

    scorecard.capabilities = [];

    for (
      let questionIndex = 0;
      questionIndex < percentages.length;
      questionIndex++
    ) {
      const capability = new Capability();
      capability.title = percentages[questionIndex]["capability"];
      capability.capabilityId = themeIndex + 1 + "." + (questionIndex + 1);
      capability.keyEvidence = this.convertListToListInHTML(
        keyEvidence[questionIndex] as string[]
      );
      capability.keyEvidenceArray = keyEvidence[questionIndex];
      capability.questions = scorecardQuestions[
        questionIndex
      ] as ScorecardQuestion[];
      capability.maturity = percentages[questionIndex]["maturity"];
      scorecard.capabilities.push(capability);
    }

    return scorecard;
  }

  getCapabilityPercentagesInTheme(
    diagnostic: Diagnostic,
    themeIndex: number,
    userData: UserDiagnosticData,
    flatMap
  ): object[] {
    const theme = diagnostic.themes[themeIndex];

    // This maps capability names to the current score for that capability
    const currentScores = [];

    // This keeps track of the capability names for each question
    const capNames = [];

    // This maps capability names to the max score for that capability
    const maxScores = [];

    const questions = flatMap.get(theme.id).map((obj) => obj.question);

    for (
      let questionIndex = 0;
      questionIndex < questions.length;
      questionIndex++
    ) {
      let currentMax = 0;

      const question = questions[questionIndex];

      const answerId = userData.responses[question.id]
        ? userData.responses[question.id].answerId
        : null;
      let answer = null;
      if (question.answer === undefined || question.answer === null) {
        answer = null;
      } else {
        answer = question.answers.find((a) => a.id === answerId);
      }

      const userScore = answer ? answer.value : 0;

      capNames[questionIndex] = question.capability;
      if (question.hasOwnProperty("answers")) {
        for (const a of question.answers) {
          if (a.value > currentMax) {
            currentMax = a.value;
          }
        }
      } else {
        console.log("Found empty question with no answers");
      }

      if (currentScores[questionIndex] === undefined) {
        currentScores[questionIndex] = 0;
      }

      currentScores[questionIndex] += userScore;
      maxScores[questionIndex] = currentMax;
    }

    const percentages = [];

    // Calculate the percentages gotten for each capability
    for (let i = 0; i < currentScores.length; i++) {
      const percentage = Math.floor((currentScores[i] / maxScores[i]) * 100);
      percentages[i] = { maturity: percentage, capability: capNames[i] };
    }

    return percentages;
  }

  getAverageScoreOfTheme(
    diagnostic: Diagnostic,
    themeIndex: number,
    userData: UserDiagnosticData,
    flatMap
  ) {
    const percentages = this.getCapabilityPercentagesInTheme(
      diagnostic,
      themeIndex,
      userData,
      flatMap
    );
    let sum = 0;

    for (let i = 0; i < percentages.length; i++) {
      sum += percentages[i]["maturity"];
    }

    return Math.floor(sum / percentages.length);
  }

  getKeyEvidenceAndFindingsAndQuestionMetadataOfCapability(
    diagnostic: Diagnostic,
    themeIndex: number,
    userData: UserDiagnosticData,
    flatMap
  ) {
    const theme = diagnostic.themes[themeIndex];

    // This maps capability names to the array of keyEvidence
    const keyEvidence = [];
    const findingsMap = new Map<string, string[]>();
    const scorecardQuestionMap = [];

    const flatQuestions = flatMap.get(theme.id).map((obj) => obj.question);

    for (
      let questionIndex = 0;
      questionIndex < flatQuestions.length;
      questionIndex++
    ) {
      const question = flatQuestions[questionIndex];

      const userResponse = userData.responses[question.id];
      const answerId = userResponse ? userResponse.answerId : null;
      let answerText;
      if (question.hasOwnProperty("answers")) {
        answerText = question.answers.find((answer) => answer.id === answerId)
          ? question.answers.find(
              (answer) => answer.id === userResponse.answerId
            ).text
          : null;
      } else {
        console.log("One of question.answers fields is undefined");
      }
      const evidence =
        userResponse && userResponse.notes ? userResponse.notes : null;

      const scorecardQuestion = new ScorecardQuestion();
      scorecardQuestion.maturityIndicator = question.text;
      scorecardQuestion.chosenAnswer = answerText;
      if (question.hasOwnProperty("answers")) {
        scorecardQuestion.harveyBallText = question.answers.map(
          (answer) => answer.text
        );
      } else {
        console.log(
          "One of question.answers is undefined when trying to read harvey ball"
        );
      }

      if (question.scorecardType !== "" && !isNaN(+question.scorecardType)) {
        question.scorecardType =
          diagnostic.inventory[question.scorecardType].name;
      }

      let currentFindings = findingsMap.get(question.scorecardType);
      if (currentFindings === undefined) {
        currentFindings = [];
      }

      currentFindings.push(answerText);
      findingsMap.set(question.scorecardType, currentFindings);

      let scorecardQuestions = scorecardQuestionMap[questionIndex];
      if (scorecardQuestions === undefined) {
        scorecardQuestions = [];
      }

      scorecardQuestions.push(scorecardQuestion);
      scorecardQuestionMap[questionIndex] = scorecardQuestions;

      let currentEvidence = keyEvidence[questionIndex];
      if (currentEvidence === undefined) {
        currentEvidence = [];
      }
      if (evidence !== null) {
        currentEvidence.push(evidence);
      }
      keyEvidence[questionIndex] = currentEvidence;
    }

    const getKeyEvidenceAndFindingsAndQuestionMetadataOfCapability = [
      keyEvidence,
      findingsMap,
      scorecardQuestionMap,
    ];
    return getKeyEvidenceAndFindingsAndQuestionMetadataOfCapability;
  }
}
