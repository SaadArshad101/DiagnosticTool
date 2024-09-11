import { Injectable } from "@angular/core";
import {
  Diagnostic,
  UserDiagnosticData,
  Rubric,
  Scorecard,
} from "../_models/http_resource";

@Injectable({
  providedIn: "root",
})
export class AnalyticsService {
  constructor() {}
  current_hovered_title;

  getAggregratedNotes(diagnostic, flattenedQuestionMap) {
    const notesMap = {};

    for (const userData of diagnostic.userData) {
      for (const theme of diagnostic.themes) {
        //add if statement for checking theme against selected theme
        if (theme == this.current_hovered_title) {
          // code to only grab notes from this theme
          const currentThemeQuestions = flattenedQuestionMap
            .get(theme.id)
            .map((obj) => obj["question"]);

          for (const question of currentThemeQuestions) {
            const notes = userData.responses[question.id]
              ? userData.responses[question.id].notes
              : null;
            if (notes) {
              if (notesMap[notes]) {
                notesMap[question.id].push(notes);
              } else {
                notesMap[question.id] = [notes];
              }
            }
          }
        }
      }
    }

    for (const key of Object.keys(notesMap)) {
      notesMap[key] = this.convertListToListInHTML(
        this.filterDuplicateItemsFromArray(notesMap[key])
      );
    }

    return notesMap;
  }

  getThemeAggregratedNotes(diagnostic, flattenedQuestionMap) {
    const notesMap = {};

    for (const userData of diagnostic.userData) {
      for (const theme of diagnostic.themes) {
        const currentThemeQuestions = flattenedQuestionMap
          .get(theme.id)
          .map((obj) => obj["question"]);

        for (const question of currentThemeQuestions) {
          const notes = userData.responses[question.id]
            ? userData.responses[question.id].notes
            : null;
          if (notes) {
            if (notesMap[notes]) {
              notesMap[question.id].push(notes);
            } else {
              notesMap[question.id] = [notes];
            }
          }
        }
      }
    }

    for (const key of Object.keys(notesMap)) {
      notesMap[key] = this.convertListToListInHTML(
        this.filterDuplicateItemsFromArray(notesMap[key])
      );
    }

    return notesMap;
  }

  getAggregatedDiagnosticNotes(diagnostic) {
    let notes = [];

    for (const userData of diagnostic.userData) {
      notes.push(userData.diagnosticNotes);
    }

    return this.convertListToListInHTML(
      this.filterDuplicateItemsFromArray(notes)
    );
  }

  getAggregratedSwot(diagnostic) {
    let strengths = [];
    let weaknesses = [];
    let opportunities = [];
    let threats = [];

    for (const userData of diagnostic.userData) {
      strengths.push(userData.swot.strengths);
      weaknesses.push(userData.swot.weaknesses);
      opportunities.push(userData.swot.opportunities);
      threats.push(userData.swot.threats);
    }

    strengths = strengths.flat();
    weaknesses = weaknesses.flat();
    opportunities = opportunities.flat();
    threats = threats.flat();

    threats = this.filterDuplicateItemsFromArray(threats);
    weaknesses = this.filterDuplicateItemsFromArray(weaknesses);
    opportunities = this.filterDuplicateItemsFromArray(opportunities);
    strengths = this.filterDuplicateItemsFromArray(strengths);

    const aggregatedSwot = {};

    aggregatedSwot["strengths"] = this.convertListToListInHTML(strengths);
    aggregatedSwot["weaknesses"] = this.convertListToListInHTML(weaknesses);
    aggregatedSwot["opportunities"] =
      this.convertListToListInHTML(opportunities);
    aggregatedSwot["threats"] = this.convertListToListInHTML(threats);

    return aggregatedSwot;
  }

  convertListToListInHTML(list: string[]) {
    if (list === undefined || list === null || list.length === 0) {
      return "";
    }
    let htmlList = "<ul>";
    for (const ele of list) {
      const li = "<li>" + ele + "</li>";
      htmlList += li;
    }
    htmlList += "</ul>";

    if (htmlList === "<ul><li></li></ul>") {
      return "";
    }

    return htmlList;
  }

  filterDuplicateItemsFromArray(arr: string[]): string[] {
    if (arr !== undefined) {
      const unique = Array.from(new Set(arr.filter((ele) => ele != null)));
      return unique;
    }
    return [];
  }

  // https://www.mathsisfun.com/data/standard-deviation-formulas.html
  calculateStandardDeviation(arr): number {
    let sum = 0;
    let mean;
    let squaredSumOfDifferences = 0;
    let squaredMean;
    let standardDeviation;

    for (const num of arr) {
      sum += num;
    }

    mean = sum / arr.length;

    for (const num of arr) {
      squaredSumOfDifferences += (num - mean) * (num - mean);
    }

    squaredMean = squaredSumOfDifferences / arr.length;
    standardDeviation = Math.floor(Math.sqrt(squaredMean));

    return standardDeviation;
  }

  getThemeStandardDeviations(
    diagnostic: Diagnostic,
    flattenedQuestionMap
  ): number[] {
    const standardDeviations = [];
    const arr = [];

    for (const userData of diagnostic.userData) {
      const userAverages = this.getThemePercentagesOfUser(
        diagnostic,
        userData,
        flattenedQuestionMap
      );
      arr.push(userAverages);
    }

    // Get a 2D array where each row represents a theme and each user's percentage score on that theme
    const transposedArr = this.transpose(arr);

    for (const themeScores of transposedArr) {
      standardDeviations.push(this.calculateStandardDeviation(themeScores));
    }

    return standardDeviations;
  }

  // Return a 2 by X array where row 1 is mins and row 2 is maxs. X is the number of themes
  getMinMax(diagnostic: Diagnostic, flattenedQuestionMap): number[][] {
    const mins = [];
    const maxs = [];

    const arr = [];

    for (const userData of diagnostic.userData) {
      const userAverages = this.getThemePercentagesOfUser(
        diagnostic,
        userData,
        flattenedQuestionMap
      );
      arr.push(userAverages);
    }

    const transposedArr = this.transpose(arr);

    for (const themeScores of transposedArr) {
      mins.push(Math.min.apply(null, themeScores));
      maxs.push(Math.max.apply(null, themeScores));
    }

    return [mins, maxs];
  }

  // http://geniuscarrier.com/transpose-in-javascript/
  transpose(a: any[][]) {
    if (!a || a.length === 0) {
      return [];
    }

    return Object.keys(a[0]).map(function (c) {
      return a.map(function (r) {
        return r[c];
      });
    });
  }

  getRubricCounts(
    diagnostic: Diagnostic,
    flattenedQuestionMap
  ): Map<string, number> {
    const rubricMap = new Map<string, number>();

    for (const rubric of diagnostic.rubric) {
      rubricMap.set(rubric.title, 0);
    }

    for (const userData of diagnostic.userData) {
      const rubrics = this.getMatchingRubricsOfUser(
        diagnostic,
        userData,
        flattenedQuestionMap
      );

      for (const rubric of rubrics) {
        rubricMap.set(rubric.title, rubricMap.get(rubric.title) + 1);
      }
    }

    return rubricMap;
  }

  getThemePercentagesOfUser(
    diagnostic: Diagnostic,
    userData: UserDiagnosticData,
    flattenedQuestionMap
  ): number[] {
    const maxScores = this.getMaxScores(diagnostic, flattenedQuestionMap);
    const scores = this.getThemeScoresOfUser(
      diagnostic,
      userData,
      flattenedQuestionMap
    );

    const percentages = [];

    for (let i = 0; i < maxScores.length; i++) {
      if (maxScores[i] === 0) {
        percentages.push(0);
      } else {
        percentages.push((scores[i] / maxScores[i]) * 100);
      }
    }

    return percentages;
  }

  filterOutInvisibleThemes(diagnostic): Diagnostic {
    // Deep copy
    diagnostic = JSON.parse(JSON.stringify(diagnostic));

    const visibleIndexes = [];

    for (let i = 0; i < diagnostic.themes.length; i++) {
      if (diagnostic.themes[i].visible) {
        visibleIndexes.push(i);
      }
    }

    // Make themes only contain the themes that are visible
    diagnostic.themes = visibleIndexes.map((item) => diagnostic.themes[item]);

    // Make roadMap arr only contain roadmaps that correspond to visible themes
    diagnostic.roadmap = visibleIndexes.map((item) => diagnostic.roadmap[item]);

    return diagnostic;
  }

  // Returns an array of the max scores each visible theme can have
  getMaxScores(diagnostic: Diagnostic, flattenedQuestionMap): number[] {
    const maxScores = [];

    for (const theme of diagnostic.themes) {
      if (theme.visible) {
        maxScores.push(this.getMaxScoreOfTheme(theme, flattenedQuestionMap));
      }
    }

    return maxScores;
  }

  getValueOfResponse(question, userData) {
    const response = userData.responses[question.id];

    if (response && response.answerId) {
      const answer = question.answers.find(
        (ans) => ans.id === response.answerId
      );
      if (answer !== undefined) {
        return answer.value;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  getResponseOfQuestion(question, userData) {
    const response = userData.responses[question.id];

    if (response && response.answerId) {
      const answer = question.answers.find(
        (ans) => ans.id === response.answerId
      );
      if (answer !== undefined) {
        return answer;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getResponses(
    diagnostic,
    userData,
    flattenedQuestionMap,
    disabledQuestionIds
  ) {
    const responses = [];

    for (const theme of diagnostic.themes) {
      if (theme.visible) {
        const objects = flattenedQuestionMap.get(theme.id);
        const themeResponses = [];
        for (const obj of objects) {
          if (
            disabledQuestionIds.findIndex((id) => id === obj["question"].id) ===
            -1
          ) {
            themeResponses.push(
              this.getResponseOfQuestion(obj["question"], userData)
            );
          } else {
            // Question got skipped
            themeResponses.push(null);
          }
        }

        responses.push(themeResponses);
      }
    }

    return responses;
  }

  getThemeScoresOfUser(diagnostic, userData, flattenedQuestionMap): number[] {
    const scores = [];

    for (const theme of diagnostic.themes) {
      if (theme.visible) {
        let score = 0;
        const questions = flattenedQuestionMap
          .get(theme.id)
          .map((obj) => obj["question"]);

        for (const question of questions) {
          score += this.getValueOfResponse(question, userData);
        }
        scores.push(score);
      }
    }

    return scores;
  }

  getTotalScoreOfUser(diagnostic, userData, flattenedQuestionMap): number {
    return this.getThemeScoresOfUser(
      diagnostic,
      userData,
      flattenedQuestionMap
    ).reduce((partialSum, a) => partialSum + a, 0);
  }

  getMaxScoreOfTheme(theme, flattenedQuestionMap): number {
    let maxScore = 0;
    const questions = flattenedQuestionMap
      .get(theme.id)
      .map((obj) => obj["question"]);

    for (const question of questions) {
      let currentMax = 0;
      if (question.hasOwnProperty("answers")) {
        for (const answer of question.answers) {
          if (answer.value > currentMax) {
            currentMax = answer.value;
          }
        }
      } else {
        console.log("Found empty question with no answers");
      }

      maxScore += currentMax;
    }

    return maxScore;
  }

  /***** GET INDIVIDUAL RUBRICS *****/

  /** returns all matching rubrics of a single user */
  getMatchingRubricsOfUser(
    diagnostic: Diagnostic,
    userData: UserDiagnosticData,
    flattenedQuestionMap
  ): Rubric[] {
    const diagnosticRubrics = this.getMatchingDiagnosticRubricsOfUser(
      diagnostic,
      userData,
      flattenedQuestionMap
    );
    const themeRubrics = this.getMatchingThemeRubricsOfUser(
      diagnostic,
      userData,
      flattenedQuestionMap
    );
    const capabilityRubrics = this.getMatchingCapabilityRubricsOfUser(
      diagnostic,
      userData,
      flattenedQuestionMap
    );

    const matchingRubrics = diagnosticRubrics.concat(
      themeRubrics,
      capabilityRubrics
    );

    return matchingRubrics;
  }

  /** returns matching theme rubrics of a single user */
  getMatchingThemeRubricsOfUser(
    diagnostic,
    userData: UserDiagnosticData,
    flattenedQuestionMap
  ): Rubric[] {
    const rubrics = [];
    const themeScores: number[] = this.getThemeScoresOfUser(
      diagnostic,
      userData,
      flattenedQuestionMap
    );

    // Map themes to scores
    const themeScoreMap = new Map<string, number>();

    for (let i = 0; i < themeScores.length; i++) {
      themeScoreMap.set(diagnostic.themes[i].id, themeScores[i]);
    }

    for (const rubric of diagnostic.rubric) {
      const themeScore = themeScoreMap.get(rubric.entity);

      // changed condition from rubric.level === 'Theme' && (rubric.min && rubric.max) && themeScore <= rubric.max && themeScore >= rubric.min to this
      if (
        rubric.level === "Theme" &&
        themeScore <= rubric.max &&
        themeScore >= rubric.min
      ) {
        rubrics.push(rubric);
      }
    }

    return rubrics;
  }

  /** returns matching diagnostic rubrics of a single user */
  getMatchingDiagnosticRubricsOfUser(
    diagnostic: Diagnostic,
    userData: UserDiagnosticData,
    flattenedQuestionMap
  ): Rubric[] {
    const rubrics = [];
    const totalScore = this.getTotalScoreOfUser(
      diagnostic,
      userData,
      flattenedQuestionMap
    );

    for (const rubric of diagnostic.rubric) {
      // changed from (rubric.level === 'Diagnostic' && (rubric.min && rubric.max) && totalScore <= rubric.max && totalScore >= rubric.min)
      if (
        rubric.level === "Diagnostic" &&
        totalScore <= rubric.max &&
        totalScore >= rubric.min
      ) {
        rubrics.push(rubric);
      }
    }

    return rubrics;
  }

  /** returns matching capability rubrics of a single user */
  getMatchingCapabilityRubricsOfUser(
    diagnostic,
    userData: UserDiagnosticData,
    flattenedQuestionMap
  ): Rubric[] {
    const rubrics = [];
    const capabilityScoreMap = this.getCapabilityScoresOfUser(
      diagnostic,
      userData,
      flattenedQuestionMap
    );

    for (const rubric of diagnostic.rubric) {
      const capabilityScore = capabilityScoreMap.get(rubric.entity);

      // changed from (rubric.level === 'Capability' && (rubric.min && rubric.max) && capabilityScore <= rubric.max && capabilityScore >= rubric.min)
      if (
        rubric.level === "Diagnostic" &&
        capabilityScore <= rubric.max &&
        capabilityScore >= rubric.min
      ) {
        rubrics.push(rubric);
      }
    }

    return rubrics;
  }

  /** Returns a map of a capability string to its score */
  getCapabilityScoresOfUser(
    diagnostic: Diagnostic,
    userData: UserDiagnosticData,
    flattenedQuestionMap
  ): Map<string, number> {
    const map = new Map<string, number>();

    for (let i = 0; i < diagnostic.themes.length; i++) {
      const theme = diagnostic.themes[i];
      const questions = flattenedQuestionMap
        .get(theme.id)
        .map((obj) => obj["question"]);
      // console.log("questions", questions);
      for (let j = 0; j < questions.length; j++) {
        if (questions[j].tags != undefined || questions[j].tags != null) {
          for (const tag of questions[j].tags) {
            map.set(
              tag["value"],
              this.getValueOfResponse(questions[j], userData)
            );
          }
        } else {
          console.log("Questions object has an empty tags array");
        }
      }
    }

    return map;
  }

  /***** GET AGGREGATE RUBRICS *****/

  /** gets matching rubrics based on aggregate score data accross all users */
  getAggregateMatchingRubrics(
    diagnostic: Diagnostic,
    flattenedQuestionMap
  ): Rubric[] {
    // will have the average theme scores across all diagnostic takers
    const averageThemeScores: number[] = this.getAverageThemeScores(
      diagnostic,
      flattenedQuestionMap
    );

    const themeRubrics = this.getAggregateThemeRubrics(
      diagnostic,
      averageThemeScores
    ); // get theme level rubrics
    const diagnosticRubrics = this.getAggregateDiagnosticRubrics(
      diagnostic,
      averageThemeScores
    ); // get diagnostic level rubrics
    const rubrics = diagnosticRubrics.concat(themeRubrics); // add all matching rubrics together

    // return the rubrics
    return rubrics;
  }

  /** gets aggregate theme rubrics based on an average of all user scores */
  getAggregateThemeRubrics(
    diagnostic: Diagnostic,
    averageThemeScores: number[]
  ): Rubric[] {
    const rubrics = [];
    // map themes by id to scores
    const themeScoreMap = new Map<string, number>();
    for (let i = 0; i < averageThemeScores.length; i++) {
      themeScoreMap.set(diagnostic.themes[i].id, averageThemeScores[i]);
    }

    // get theme level rubrics that match
    for (const rubric of diagnostic.rubric) {
      // get theme score by themeid
      const themeScore = themeScoreMap.get(rubric.entity);

      if (
        rubric.level === "Theme" &&
        themeScore <= rubric.max &&
        themeScore >= rubric.min
      ) {
        // add matching rubric
        rubrics.push(rubric);
      }
    }
    return rubrics;
  }

  /** gets aggregate diagnostic rubrics based on an average score of all user scores */
  getAggregateDiagnosticRubrics(
    diagnostic: Diagnostic,
    averageThemeScores: number[]
  ): Rubric[] {
    const rubrics = [];
    // get the total score of all the themes
    const totalScore = averageThemeScores.reduce(
      (partialSum, a) => partialSum + a,
      0
    );

    for (const rubric of diagnostic.rubric) {
      // add matching rubric
      if (
        rubric.level === "Diagnostic" &&
        rubric.min &&
        rubric.max &&
        totalScore <= rubric.max &&
        totalScore >= rubric.min
      ) {
        rubrics.push(rubric);
      }
    }
    return rubrics;
  }

  /** returns an array of average theme scores across all diagnostic takers */
  getAverageThemeScores(
    diagnostic: Diagnostic,
    flattenedQuestionMap
  ): number[] {
    // will store teh sum of all the themes scores
    let sums = [];

    // starts the sum with 0 for each theme in a diagnostic
    for (const theme of diagnostic.themes) {
      sums.push(0);
    }

    // loop through each user data that exists in the diagnostic
    for (const userData of diagnostic.userData) {
      // get the theme score of the user
      const userAverages = this.getThemeScoresOfUser(
        diagnostic,
        userData,
        flattenedQuestionMap
      );
      // add the theme scores of the user to the overall sums
      sums = sums.map((num, index) => num + userAverages[index]);
    }

    // gets the averages across the total theme scores by dividing each element at index i by number of users
    const averages = sums.map((sum) =>
      Math.floor(sum / diagnostic.userData.length)
    );

    // return the averages
    return averages;
  }

  /** returns theme averages in an percentage format */
  getThemeAverages(diagnostic, flattenedQuestionMap): number[] {
    let sums = [];

    for (const theme of diagnostic.themes) {
      sums.push(0);
    }

    for (const userData of diagnostic.userData) {
      const userAverages = this.getThemePercentagesOfUser(
        diagnostic,
        userData,
        flattenedQuestionMap
      );
      sums = sums.map((num, index) => num + userAverages[index]);
    }

    const averages = sums.map((sum) =>
      Math.floor(sum / diagnostic.userData.length)
    );

    return averages;
  }
}
