import {
  Component,
  OnInit,
  ElementRef,
  Renderer2,
  HostListener,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DataService } from "../_services/data.service";
import { Title } from "@angular/platform-browser";
import { AnalyticsService } from "../_services/analytics.service";
import { PlotlyService } from "angular-plotly.js";
import { saveAs } from "file-saver";
import { Swot, UserDiagnosticData, Theme } from "../_models/http_resource";
// import { ConnectedPositionStrategy } from "@angular/cdk/overlay";
import { ScorecardService } from "../_services/scorecard.service";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { ScorecardComponent } from "../scorecard/scorecard.component";
import { ResponseService } from "../_services/response.service";
// import { Chart } from "chart.js";

@Component({
  selector: "app-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.css"],
})
export class AnalyticsComponent implements AfterViewInit {
  userData;
  matchingRubrics;

  // variables to determine which chart shows up on the "result" tab
  showRadarChart = true;
  showBarChart = false;

  averages;
  labels;

  //for word cloud setup
  wordCloudType = "word-cloud";
  wordCloudWords = [];
  wordCloudData = [];

  diagnostic;
  aggScorecards = null;
  generatedScorecards;

  // First index is theme index, second index is question index.
  // Each question in the diagnostic has a map that maps each possible answer text of a question to a response count
  responseMap: Map<string, number> = new Map<string, number>();
  responseCounts: Map<string, number>[][] = [];
  graphDataArr: Object[][] = [];
  considerationGraphData: Object = {};
  themeAveragesGraphData: Object = {};
  currentTab;

  answerGraphLayout = {
    xaxis: {
      tickformat: ",d",
      rangemode: "tozero",
    },
    yaxis: {
      title: {
        text: "Total responses",
      },
      tickformat: ",d",
      rangemode: "tozero",
    },
    autosize: true,
    height: 300,
    margin: {
      b: 30,
      t: 30,
    },
  };

  considerationGraphLayout = {
    title: {
      text: "Strategic consideration counts",
    },
    xaxis: {
      title: {
        text: "Consideration Title",
      },
      tickformat: ",d",
      rangemode: "tozero",
    },
    yaxis: {
      title: {
        text: "Total users",
      },
      tickformat: ",d",
      rangemode: "tozero",
    },
  };

  themeAveragesGraphLayout = {
    autosize: true,
    title: {
      text: "Theme scores",
      font: {
        size: 32,
      },
    },
    xaxis: {
      title: {
        text: "Theme",
      },
      tickformat: ",d",
      rangemode: "tozero",
    },
    yaxis: {
      title: {
        text: "Average score",
      },
      tickformat: ",d",
      rangemode: "tozero",
    },
  };

  swotTraits1 = ["strengths", "weaknesses"];
  swotTraits2 = ["opportunities", "threats"];
  aggregratedSwot = null;
  aggregratedQuestionNotes = null;
  aggregratedThemeQuestionNotes = null;
  aggregatedDiagnosticNotes = null;

  flattenedQuestions;
  disabledQuestions;

  @ViewChild(ScorecardComponent, null)
  private scorecardComponent: ScorecardComponent;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private titleService: Title,
    private analyticsService: AnalyticsService,
    private scorecardService: ScorecardService,
    private plotlyService: PlotlyService,
    private el: ElementRef,
    private renderer: Renderer2,
    private responseService: ResponseService
  ) {}

  ngOnInit() {
    this.route.snapshot.paramMap.get("diagid");

    this.dataService
      .getDiagnostic(this.route.snapshot.paramMap.get("diagid"))
      .subscribe((diagnostic) => {
        this.diagnostic =
          this.analyticsService.filterOutInvisibleThemes(diagnostic);

        new Promise((resolve, reject) => {
          resolve(this.analyticsService.filterOutInvisibleThemes(diagnostic));
        }).then((diag) => {
          this.diagnostic = diag;

          this.flattenedQuestions = this.responseService.getFlattenQuestionsMap(
            this.diagnostic
          );
          this.disabledQuestions = this.responseService.getDisabledQuestions(
            this.diagnostic,
            this.flattenedQuestions,
            this.getUserData()
          );

          this.generatedScorecards =
            this.scorecardService.getAggregratedScorecards(
              this.diagnostic,
              this.flattenedQuestions
            );
          if (
            this.diagnostic.scorecards === null ||
            this.diagnostic.scorecards === undefined ||
            this.diagnostic.scorecards.length === 0
          ) {
            this.aggScorecards = this.generatedScorecards;
          } else {
            this.aggScorecards = this.diagnostic.scorecards;
          }

          if (
            this.diagnostic.aggregratedSwot === null ||
            this.diagnostic.aggregratedSwot === undefined ||
            this.diagnostic.aggregratedSwot.length === 0
          ) {
            this.aggregratedSwot = this.analyticsService.getAggregratedSwot(
              this.diagnostic
            );
          } else {
            this.aggregratedSwot = this.diagnostic.aggregratedSwot;
          }

          if (
            this.diagnostic.aggregratedQuestionNotes === null ||
            this.diagnostic.aggregratedQuestionNotes === undefined ||
            this.diagnostic.aggregratedQuestionNotes.length === 0
          ) {
            this.aggregratedQuestionNotes =
              this.analyticsService.getAggregratedNotes(
                this.diagnostic,
                this.flattenedQuestions
              );
          } else {
            this.aggregratedQuestionNotes =
              this.diagnostic.aggregratedQuestionNotes;
          }

          if (
            this.diagnostic.aggregratedThemeQuestionNotes === null ||
            this.diagnostic.aggregratedThemeQuestionNotes === undefined ||
            this.diagnostic.aggregratedThemeQuestionNotes.length === 0
          ) {
            this.aggregratedThemeQuestionNotes =
              this.analyticsService.getAggregratedNotes(
                this.diagnostic,
                this.flattenedQuestions
              );
          } else {
            this.aggregratedThemeQuestionNotes =
              this.diagnostic.aggregratedThemeQuestionNotes;
          }

          if (
            this.diagnostic.aggregatedDiagnosticNotes === null ||
            this.diagnostic.aggregatedDiagnosticNotes === undefined ||
            this.diagnostic.aggregatedDiagnosticNotes.length === 0
          ) {
            this.aggregatedDiagnosticNotes =
              this.analyticsService.getAggregatedDiagnosticNotes(
                this.diagnostic
              );
          } else {
            this.aggregatedDiagnosticNotes =
              this.diagnostic.aggregatedDiagnosticNotes;
          }

          // Parse user input from aggregatedDiagnosticNotes (General Notes) and generate word cloud data
          // const inputArray = this.aggregatedDiagnosticNotes.split(",").map;

          // // Define an arary of excluded words
          // let excludedWords = [
          //   "good",
          //   "see",
          //   "across",
          //   "need",
          //   "set",
          //   "folks",
          //   `don't`,
          //   "first",
          //   "1",
          //   "2",
          //   "3",
          //   "4",
          //   "5",
          //   "6",
          //   "7",
          //   "8",
          //   "9",
          //   "0",
          //   "etc",
          //   "lot",
          //   "part",
          //   "like",
          //   "initial",
          //   `can't`,
          //   "left",
          //   "group",
          //   "go",
          //   "because",
          //   "b/c",
          //   "get",
          //   "put",
          //   "it",
          //   `it's`,
          //   "i",
          //   "I",
          //   "me",
          //   "my",
          //   "myself",
          //   "we",
          //   "-",
          //   "us",
          //   "our",
          //   "ours",
          //   "ourselves",
          //   "you",
          //   "your",
          //   "yours",
          //   "yourself",
          //   "yourselves",
          //   "he",
          //   "him",
          //   "his",
          //   "himself",
          //   "she",
          //   "her",
          //   "hers",
          //   "herself",
          //   "it",
          //   "its",
          //   "itself",
          //   "they",
          //   "them",
          //   "their",
          //   "theirs",
          //   "themselves",
          //   "what",
          //   "which",
          //   "who",
          //   "whom",
          //   "whose",
          //   "this",
          //   "that",
          //   "these",
          //   "those",
          //   "am",
          //   "is",
          //   "are",
          //   "was",
          //   "were",
          //   "be",
          //   "been",
          //   "being",
          //   "have",
          //   "has",
          //   "had",
          //   "having",
          //   "do",
          //   "does",
          //   "did",
          //   "doing",
          //   "will",
          //   "would",
          //   "should",
          //   "can",
          //   "could",
          //   "ought",
          //   "a",
          //   "an",
          //   "the",
          //   "and",
          //   "but",
          //   "if",
          //   "or",
          //   "because",
          //   "as",
          //   "until",
          //   "while",
          //   "of",
          //   "at",
          //   "by",
          //   "for",
          //   "with",
          //   "about",
          //   "against",
          //   "between",
          //   "into",
          //   "through",
          //   "during",
          //   "before",
          //   "after",
          //   "above",
          //   "below",
          //   "to",
          //   "from",
          //   "up",
          //   "upon",
          //   "down",
          //   "in",
          //   "out",
          //   "on",
          //   "off",
          //   "over",
          //   "under",
          //   "again",
          //   "further",
          //   "then",
          //   "once",
          //   "here",
          //   "there",
          //   "when",
          //   "where",
          //   "why",
          //   "ho w",
          //   "all",
          //   "any",
          //   "both",
          //   "each",
          //   "few",
          //   "more",
          //   "most",
          //   "other",
          //   "some",
          //   "such",
          //   "no",
          //   "nor",
          //   "not",
          //   "only",
          //   "own",
          //   "same",
          //   "so",
          //   "than",
          //   "too",
          //   "very",
          //   "say",
          //   "says",
          //   "said",
          //   "shall",
          // ];

          // // this code snippet makes a word cloud on the aggregated page that is made from words in the general notes section
          // const tempDiv = document.createElement("div");
          // const minSize = 10;
          // const maxSize = 12;
          // tempDiv.innerHTML = this.aggregatedDiagnosticNotes;
          // const wordCloudText = tempDiv.textContent || tempDiv.innerText;

          // // Replace periods with an empty string
          // const userInputWithoutPeriods = wordCloudText.replace(/\./g, "");

          // // Removed words that are in the excluded list
          // const wordList = userInputWithoutPeriods
          //   .trim()
          //   .split(/\s+/)
          //   .filter((word) => !excludedWords.includes(word.toLowerCase()));
          // // Remove repeated words using Set
          // const uniqueWordsSet = new Set(wordList);
          // const uniqueWordsArray = Array.from(uniqueWordsSet);

          // // Count word occurrences
          // const wordCounts = {};
          // uniqueWordsArray.forEach((word) => {
          //   const lowercaseWord = word.toLowerCase();
          //   wordCounts[lowercaseWord] = (wordCounts[lowercaseWord] || 0) + 1;
          // });

          // // Find the max word count
          // const maxWordCount = Math.max.apply(null, Object.values(wordCounts));

          // this.wordCloudData = uniqueWordsArray.map(function (d) {
          //   return {
          //     text: d,
          //     // value: 10 + Math.random() * (maxSize - minSize) + minSize,
          //     value: 10 + wordCounts[d.toLowerCase()] / maxWordCount + 40,
          //   };
          // });
          // // console.log("this is wordCloudData " + this.wordCloudData);

          //start of word cloud aggregated report
          let themeArrays = [];
          let completeArray = [];
          let hashmap = new Map<string, any[]>();
          for (const userData of this.diagnostic.userData) {
            for (const theme of this.diagnostic.themes) {
              if (!hashmap.has(theme.title)) {
                hashmap.set(theme.title, []);
              }
              const currentThemeQuestions =
                this.getFlattenedQuestionsOfTheme(theme);
              for (const question of currentThemeQuestions) {
                if (
                  userData.responses[question.id] &&
                  userData.responses[question.id].notes
                ) {
                  let fullResponse = userData.responses[question.id].notes;
                  let extractedText = this.removeHTMLTags(fullResponse);
                  let extractedWords = this.processResponses(extractedText);
                  if (hashmap.has(theme.title)) {
                    hashmap.get(theme.title)!.push(extractedWords);
                  }
                }
              }
              const result = this.combineArraysFromHashmap(
                hashmap,
                theme.title
              );
              themeArrays.push(result);
            }
            completeArray = [].concat(...themeArrays);
            themeArrays.push(completeArray);
            this.wordCloudData = themeArrays;
          }

          this.mapResponses();
          this.mapConsiderations();
          this.mapThemeAverages();
          this.userData = this.getUserData();
          this.matchingRubrics =
            this.analyticsService.getAggregateMatchingRubrics(
              diagnostic,
              this.flattenedQuestions
            );
        });

        this.titleService.setTitle("Analytics - IT Strategy Diagnostic Tool");
      });
  }

  // to run when a user clicks "show radar chart" on the UI
  toggleRadarChart() {
    this.showBarChart = false;
    this.showRadarChart = true;

    // get the buttons
    const radarChartButton = document.getElementById("radar-chart-button");
    const barChartButton = document.getElementById("bar-chart-button");

    // set the color of the radar chart to be highlighted
    radarChartButton.style.backgroundColor = "#5d6b77";
    barChartButton.style.backgroundColor = "#263745";
  }

  // to run when a user clicks "show bar chart" on the UI
  toggleBarChart() {
    this.showBarChart = true;
    this.showRadarChart = false;

    // get the buttons
    const radarChartButton = document.getElementById("radar-chart-button");
    const barChartButton = document.getElementById("bar-chart-button");

    // set the color of the bar chart to be highlighted
    radarChartButton.style.backgroundColor = "#263745";
    barChartButton.style.backgroundColor = "#5d6b77";
  }

  identify(index, item) {
    return item.id;
  }

  ngAfterViewInit() {
    this.loadFirstPlot(); //Automatically load the first question plot
    this.toggleRadarChart();
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
    //Load all visible, unloaded question plots
    this.loadVisiblePlots(window.innerHeight + window.scrollY);
  }

  getVisiblePlots(pageHeight) {
    const plots = this.el.nativeElement.querySelectorAll(".qchart:empty");
    let visibleDivs = [];

    if (plots) {
      plots.forEach((element) => {
        if (element.parentNode.offsetTop < pageHeight) {
          visibleDivs.push(element);
        }
      });
    }

    return visibleDivs;
  }

  loadVisiblePlots(pageHeight) {
    //Render each unloaded plot currently in view
    this.getVisiblePlots(pageHeight).forEach((element) => {
      let idPts = element.id.split("-");
      this.renderPlot(idPts[1], idPts[2], element);
    });
  }

  renderPlot(i = 0, j = 0, element = null) {
    if (element === null) {
      element = this.el.nativeElement.querySelector("#qchart-" + i + "-" + j);
    }

    if (element && element.innerHTML === "") {
      this.plotlyService
        .getPlotly()
        .newPlot(
          element.id,
          this.graphDataArr[i][j]["data"],
          this.answerGraphLayout
        );
    }

    return !!element;
  }

  loadFirstPlot() {
    let intvl = setInterval(() => {
      //If render successful exit loop
      if (this.renderPlot()) {
        clearInterval(intvl);
      }
    }, 100);
  }

  setBarWidths(data) {
    const maxBarCountToModify = 4;
    const numToSubtractFrom = maxBarCountToModify + 2;

    if (data.length === 1) {
      if (data[0].x.length <= maxBarCountToModify) {
        data[0].width = [];

        for (let i = 0; i < data[0].x.length; i++) {
          data[0].width.push(1 / (numToSubtractFrom - data[0].x.length));
        }
      }
    } else if (data.length > 1) {
      if (data.length <= maxBarCountToModify) {
        for (let i = 0; i < data.length; i++) {
          data[i].width = [1 / (numToSubtractFrom - data.length)];
        }
      }
    }
  }

  getQuestionChartId(container, chart) {
    return "#qchart-" + container + "-" + chart;
  }

  getAnswerTextId(theme, question, answer) {
    return "answertext-" + theme + "-" + question + "-" + answer;
  }

  getAnswerCountId(theme, question, answer) {
    return "answercount-" + theme + "-" + question + "-" + answer;
  }

  hoverQuestion(container, chart, question, answerIndex) {
    const dim = "rgb(140, 140, 140)";
    const bars = this.el.nativeElement.querySelectorAll(
      this.getQuestionChartId(container, chart) + " .barlayer g.point path"
    );

    for (let i = 0; i < bars.length; i++) {
      if (i != answerIndex) {
        let color = bars[i].style.fill;

        if (bars[i].getAttribute("data-color") != dim) {
          this.renderer.setStyle(bars[i], "fill", dim);
          this.renderer.setStyle(bars[i], "fill-opacity", "0.25");
          this.renderer.setAttribute(bars[i], "data-color", color);
        }
      }
    }

    if (question.answers === null || question.answers === undefined) {
      return null;
    } else {
      for (let k = 0; k < question.answers.length; k++) {
        let answerTextId = this.getAnswerTextId(container, chart, k);
        let answerCountId = this.getAnswerCountId(container, chart, k);

        if (k === answerIndex) {
          document.getElementById(answerTextId).style.color = "#3A77AE";
          document.getElementById(answerCountId).style.color = "#3A77AE";
        } else {
          document.getElementById(answerTextId).style.color = "#8c8c8c";
          document.getElementById(answerCountId).style.color = "#8c8c8c";
        }
      }
    }
  }

  unhoverQuestions(container, chart, question) {
    const bars = this.el.nativeElement.querySelectorAll(
      this.getQuestionChartId(container, chart) + " [data-color]"
    );

    if (bars) {
      const renderer = this.renderer;

      bars.forEach((element) => {
        renderer.setStyle(element, "fill", element.getAttribute("data-color"));
        renderer.setStyle(element, "fill-opacity", 1);
        renderer.removeAttribute(element, "data-color");
      });
    }

    // Change text color to black
    if (question.answers === undefined || question.answers === null) {
      return null;
    } else {
      for (let k = 0; k < question.answers.length; k++) {
        let answerTextId = this.getAnswerTextId(container, chart, k);
        let answerCountId = this.getAnswerCountId(container, chart, k);

        document.getElementById(answerTextId).style.color = "black";
        document.getElementById(answerCountId).style.color = "black";
      }
    }
  }

  mapThemeAverages() {
    const averages = this.analyticsService.getThemeAverages(
      this.diagnostic,
      this.flattenedQuestions
    );
    const x = this.diagnostic.themes.map((theme) => theme.title);
    this.averages = averages;
    this.labels = x;

    const mins = this.analyticsService.getMinMax(
      this.diagnostic,
      this.flattenedQuestions
    )[0];
    const maxs = this.analyticsService.getMinMax(
      this.diagnostic,
      this.flattenedQuestions
    )[1];

    this.themeAveragesGraphData["data"] = [];

    for (let i = 0; i < x.length; i++) {
      let object = {
        x: [i + 1],
        name: x[i],
        y: [averages[i]],
        type: "bar",
        text: [averages[i]],
        textposition: "auto",
        hoverinfo: "y",
        error_y: {
          type: "data",
          symmetric: false,
          array: [Math.floor(maxs[i] - averages[i])],
          arrayminus: [Math.floor(averages[i] - mins[i])],
          visible: true,
        },
        showlegend: true,
      };

      this.themeAveragesGraphData["data"].push(object);
    }

    this.setBarWidths(this.themeAveragesGraphData["data"]);
  }

  mapConsiderations() {
    const considerationMap = this.analyticsService.getRubricCounts(
      this.diagnostic,
      this.flattenedQuestions
    );
    this.considerationGraphData["data"] = [{}];
    const x = Array.from(considerationMap.keys());
    const y = Array.from(considerationMap.values());
    const type = "bar";

    this.considerationGraphData["data"] = [
      {
        x: x,
        y: y,
        type: type,
        text: y.map(String),
        textposition: "auto",
        hoverinfo: "y",
      },
    ];
    this.setBarWidths(this.considerationGraphData["data"]);
  }

  getFlattenedQuestionsOfTheme(theme: Theme) {
    return this.flattenedQuestions.get(theme.id).map((obj) => obj["question"]);
  }

  // Iterate through all responses in diagnostic.userData and map individual options to the answer types
  mapResponses() {
    for (const userData of this.diagnostic.userData) {
      for (const theme of this.diagnostic.themes) {
        const currentThemeQuestions = this.getFlattenedQuestionsOfTheme(theme);
        for (const question of currentThemeQuestions) {
          const answerChoice = userData.responses[question.id]
            ? userData.responses[question.id].answerId
            : null;
          if (answerChoice) {
            if (this.responseMap.get(answerChoice)) {
              this.responseMap.set(
                answerChoice,
                this.responseMap.get(answerChoice) + 1
              );
            } else {
              this.responseMap.set(answerChoice, 1);
            }
          }
        }
      }
    }

    // Create the graph objects based on the map array
    for (let i = 0; i < this.diagnostic.themes.length; i++) {
      this.graphDataArr.push([]);

      const theme = this.diagnostic.themes[i];
      const currentThemeQuestions = this.getFlattenedQuestionsOfTheme(theme);

      for (let j = 0; j < currentThemeQuestions.length; j++) {
        this.graphDataArr[i].push({});
        const question = currentThemeQuestions[j];

        const currentGraph = this.graphDataArr[i][j];
        const answerNumberArray = [];
        const responseCountArray = [];

        if (question.answers === undefined || question.answers === null) {
          return null;
        } else {
          for (let k = 0; k < question.answers.length; k++) {
            const answer = question.answers[k];

            answerNumberArray.push(k + 1);
            responseCountArray.push(this.responseMap.get(answer.id));
          }
        }

        currentGraph["data"] = [
          {
            x: answerNumberArray,
            y: responseCountArray,
            type: "bar",
            text: responseCountArray.map(String),
            textposition: "auto",
            hoverinfo: "y",
          },
        ];
        this.setBarWidths(currentGraph["data"]);
      }
    }
  }

  exportToCSV() {
    let csvArray = [
      "Theme,Question,Answer,Value,User,Notes,Strengths,Weaknesses,Opportunities,Threats",
    ]; // CSV data with header pre-inserted

    // Get the user object
    this.diagnostic.userData.forEach((user) => {
      for (
        let i = 0;
        this.diagnostic.themes && i < this.diagnostic.themes.length;
        i++
      ) {
        let theme = this.diagnostic.themes[i];
        let questions = this.flattenedQuestions
          .get(theme.id)
          .map((obj) => obj.question);

        for (let j = 0; questions && j < questions.length; j++) {
          let question = questions[j],
            notes = "";

          const response = user.responses[question.id];
          const answer = response
            ? this.responseService.getAnswerFromId(question, response.answerId)
            : null;

          if (answer || (response && response.notes)) {
            notes = response.notes;
            const answerText = answer ? answer.text : null;
            const answerValue = answer ? answer.value : 0;
            csvArray.push(
              this.formatCSV([
                theme.title,
                question.text,
                answerText,
                answerValue,
                user.userId,
                notes,
                null,
                null,
                null,
                null,
              ])
            );
          }
        }
      }

      this.listSWOT(user).forEach((arr) => {
        csvArray.push(this.formatCSV(arr));
      });
    });

    const file = new Blob([csvArray.join("\r\n")], { type: "text/csv" });
    saveAs(file, this.diagnostic.title + ".csv");
  }

  formatCSV(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] && isNaN(arr[i])) {
        arr[i] = '"' + arr[i].replace(/<[^>]*>/g, "") + '"'; // Strip HTML and add quotes
      }
    }

    return arr.join(",");
  }

  listSWOT(user) {
    const swotKeys = ["strengths", "weaknesses", "opportunities", "threats"],
      output = [];
    let max = -1,
      i = 0;

    // Find the maximum number of SWOT responses
    swotKeys.forEach((key) => {
      max = Math.max(max, user.swot[key].length);
    });

    for (i; i < max; i++) {
      let line = [null, null, null, null, user.userId, null]; // New line with non-SWOT values blank

      swotKeys.forEach((key) => {
        line.push(user.swot[key].length > i ? user.swot[key][i] : null);
      });

      output.push(line);
    }

    return output;
  }

  upperCaseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  saveChanges() {
    this.diagnostic.scorecards = this.aggScorecards;
    this.diagnostic.aggregratedSwot = this.aggregratedSwot;
    this.diagnostic.aggregratedQuestionNotes = this.aggregratedQuestionNotes;
    this.diagnostic.aggregratedThemeQuestionNotes =
      this.aggregratedThemeQuestionNotes;
    this.diagnostic.aggregatedDiagnosticNotes = this.aggregatedDiagnosticNotes;
    this.dataService.updateDiagnostic(this.diagnostic);
  }

  resetChanges() {
    if (
      confirm(
        "Resetting the aggregrated results page will permanently remove any edits you have made here. Click OK to continue."
      )
    ) {
      this.aggregratedSwot = this.analyticsService.getAggregratedSwot(
        this.diagnostic
      );
      this.aggScorecards = this.scorecardService.getAggregratedScorecards(
        this.diagnostic,
        this.flattenedQuestions
      );
      this.aggregratedQuestionNotes = this.analyticsService.getAggregratedNotes(
        this.diagnostic,
        this.flattenedQuestions
      );
      this.aggregratedThemeQuestionNotes =
        this.analyticsService.getAggregratedNotes(
          this.diagnostic,
          this.flattenedQuestions
        );
      this.aggregatedDiagnosticNotes =
        this.analyticsService.getAggregatedDiagnosticNotes(this.diagnostic);
      this.diagnostic.scorecards = null;
      this.diagnostic.aggregratedSwot = null;
      this.diagnostic.aggregratedQuestionNotes = null;
      this.diagnostic.aggregatedDiagnosticNotes = "";

      this.dataService.updateDiagnostic(this.diagnostic);
    }
  }

  tabChange(event: MatTabChangeEvent) {
    this.currentTab = event.tab;
  }

  isTabSelected(tabName) {
    if (this.currentTab) {
      return this.currentTab.textLabel === tabName;
    }

    return tabName === "Results";
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

  getUserData(): UserDiagnosticData {
    for (const userData of this.diagnostic.userData) {
      if (userData.userId === localStorage.getItem("diagnosticUser")) {
        return userData;
      }
    }
    return new UserDiagnosticData();
  }
}
