import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "../../_services/data.service";
import { Rubric, UserDiagnosticData } from "src/app/_models/http_resource";
import { AnalyticsService } from "src/app/_services/analytics.service";
import { BentoService } from "src/app/_services/bento.service";
import { ScorecardService } from "src/app/_services/scorecard.service";
import { ResponseService } from "../../_services/response.service";

import { ScorecardComponent } from "src/app/scorecard/scorecard.component";

@Component({
  selector: "app-results",
  templateUrl: "./results.component.html",
  styleUrls: ["./results.component.css"],
})
export class ResultsComponent implements OnInit, AfterViewInit {
  // to be shown on the html render
  cpability_map;
  current_hovered_title;
  current_hovered_total_percentage;

  // chart set up
  radarChartType = "radar";
  radarChartLabels = [];
  radarChartData = [];

  //word cloud set up
  wordCloudType = "word-cloud";
  wordCloudWords = [];
  wordCloudData = [];

  diagnostic;
  title;
  diagnosticId;
  swot;
  diagnosticNotes;
  percentages;

  swotTraits1 = ["strengths", "weaknesses"];
  swotTraits2 = ["opportunities", "threats"];
  readonlyOptions = {
    toolbar: false,
  };

  noBorder = {
    border: "none",
  };

  scorecards = [];

  responses = [];
  // depth: original depth of the question. depth 1 is the root level.
  flattenedQuestionMap: Map<string, Object[]>;
  // This can have ids be repeated in the cases where they are skipped more than once
  disabledQuestionIds: string[];

  @ViewChild(ScorecardComponent, null)
  private scorecardComponent: ScorecardComponent;
  constructor(
    private dataService: DataService,
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private bentoService: BentoService,
    private scorecardService: ScorecardService,
    private responseService: ResponseService
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit() {
    this.diagnosticId = this.route.snapshot.paramMap.get("diagid");

    this.dataService
      .getDiagnostic(this.diagnosticId)
      .subscribe((diagnostic) => {
        // subscribe was being called multiple times so this is needed to reset the array and not have the label contents be repeated
        this.radarChartLabels = [];

        this.responses = [];

        if (diagnostic === null) {
          this.router.navigate(["not-found"]);
        }

        this.diagnostic =
          this.analyticsService.filterOutInvisibleThemes(diagnostic);
        this.titleService.setTitle(this.diagnostic.title + " - Report");

        const userDataPromise = new Promise<UserDiagnosticData>(
          (resolve, reject) => {
            resolve(this.getUserData());
          }
        );

        userDataPromise.then((userData) => {
          if (!this.getUserData()) {
            this.dataService.createUserEntry(
              localStorage.getItem("diagnosticUser"),
              this.diagnostic
            );
            userData = this.getUserData();
          }

          this.swot = userData.swot;
          this.diagnosticNotes = userData.diagnosticNotes;

          this.flattenedQuestionMap =
            this.responseService.getFlattenQuestionsMap(this.diagnostic);
          this.disabledQuestionIds = this.responseService.getDisabledQuestions(
            this.diagnostic,
            this.flattenedQuestionMap,
            userData
          );
          this.responses = this.analyticsService.getResponses(
            this.diagnostic,
            userData,
            this.flattenedQuestionMap,
            this.disabledQuestionIds
          );

          // Spider Chart stuff
          this.percentages = this.analyticsService.getThemePercentagesOfUser(
            this.diagnostic,
            userData,
            this.flattenedQuestionMap
          );
          this.radarChartLabels = this.diagnostic.themes.map(
            (diag) => diag.title
          );
          this.radarChartData = [
            {
              data: this.percentages,
              label: diagnostic.title,
              backgroundColor: "rgba(0, 166, 181, .2)",
              borderColor: "#00a6b5",
              pointBorderColor: "white",
              pointBackgroundColor: "#00a6b5",
            },
          ];
          //Start of word cloud individual report hash map
          let themeArrays = [];
          let completeArray = [];
          let hashmap = new Map<string, any[]>();
          for (const theme of this.diagnostic.themes) {
            if (!hashmap.has(theme.title)) {
              hashmap.set(theme.title, []);
            }

            for (const question of this.getFlatQuestionsOfTheme(theme)) {
              if (
                this.getUserData().responses[question.id] &&
                this.getUserData().responses[question.id].notes
              ) {
                let fullResponse =
                  this.getUserData().responses[question.id].notes;
                let extractedText = this.removeHTMLTags(fullResponse);
                let extractedWords = this.processResponses(extractedText);
                if (hashmap.has(theme.title)) {
                  hashmap.get(theme.title)!.push(extractedWords);
                }
              }
            }
            const result = this.combineArraysFromHashmap(hashmap, theme.title);
            themeArrays.push(result);
          }
          completeArray = [].concat(...themeArrays);
          completeArray = completeArray.concat(
            ...this.processResponses(this.removeHTMLTags(this.diagnosticNotes))
          );
          themeArrays.push(completeArray);
          this.wordCloudData = themeArrays;

          // This is where scorecards is called.
          //if (diagnostic.isScorecard) {
          for (let i = 0; i < this.diagnostic.themes.length; i++) {
            this.scorecards.push(
              this.scorecardService.getScorecardOfTheme(
                diagnostic,
                i,
                userData,
                this.flattenedQuestionMap
              )
            );
          }
          //}
        });
      });
  }

  // gets a set of scores and returns an average
  getAverageOfScores = (scores: number[]) => {
    // toFixed(x) rounds up to the x decimal
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
  };

  getFlatQuestionsOfTheme(theme) {
    return this.flattenedQuestionMap
      .get(theme.id)
      .map((obj) => obj["question"]);
  }

  getPercent(index) {
    return +this.percentages[index];
  }

  upperCaseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getMatchingRubrics(): Rubric[] {
    return this.analyticsService.getMatchingRubricsOfUser(
      this.diagnostic,
      this.getUserData(),
      this.flattenedQuestionMap
    );
  }

  getUserData(): UserDiagnosticData {
    for (const userData of this.diagnostic.userData) {
      if (userData.userId === localStorage.getItem("diagnosticUser")) {
        return userData;
      }
    }
    return null;
  }

  exportBento() {
    this.bentoService.exportBento(this.diagnostic, this.getUserData());
  }
  removeHTMLTags(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc.body.textContent || "";
  }

  processResponses(text) {
    const words = text.split(/\s/);
    return words;
  }

  combineArraysFromHashmap(
    hashmap: Map<string, any[]>,
    category: string
  ): any[] {
    if (!hashmap.has(category)) {
      return [];
    }
    let combinedArray: any[] = [];
    for (let array of hashmap.get(category)) {
      combinedArray.push(...array);
    }
    return combinedArray;
  }
}
