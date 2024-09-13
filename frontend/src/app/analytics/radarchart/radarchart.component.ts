import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
} from "@angular/core";
import { Chart } from "chart.js";
import * as Sentiment from "sentiment";
import * as d3 from "d3";
import * as d3Cloud from "d3-cloud";
import cloud from "d3-cloud";
import { filter } from "rxjs/operators";

@Component({
  selector: "radar-chart",
  templateUrl: "./radarchart.component.html",
  styleUrls: ["./radarchart.component.css"],
})
export class RadarChartComponent implements AfterViewInit {
  @Input() averages;
  @Input() labels;
  @Input() generatedScoreCards;
  @Input() diagnosticTitle;
  // added from word cloud functionality
  @Input() data;
  public wordCloudData: any;
  // end of word cloud functionality
  public chart: any;

  // to be shown on the html render
  capability_map;
  current_hovered_title = "click a data point";
  current_hovered_total_percentage;

  current_clicked_index = -1;

  // chart set up
  radarChartType = "radar";
  radarChartLabels = [];
  radarChartData = [];

  // for word cloud
  wordCloudText = [];
  wordCloudTextTheme = [];
  wordCloudInformation = [];

  constructor(private cdr: ChangeDetectorRef) {}
  ngAfterViewInit(): void {
    this.createChart();
    this.cdr.detectChanges();
  }

  customFillMapper(wordCloudData): string {
    const sentiment = new Sentiment();
    let intensity = sentiment.analyze(wordCloudData.text);
    if (intensity.comparative > 0) {
      return "green";
    } else if (intensity.comparative < 0) {
      return "red";
    } else if ((intensity.comparative = 0)) {
      return "blue";
    } else {
      return "black";
    }
  }

  filterWords(words) {
    let stopWords = [
      "good",
      "see",
      "across",
      "need",
      "set",
      "folks",
      `don't`,
      "first",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
      "etc",
      "lot",
      "part",
      "like",
      "initial",
      `can't`,
      "left",
      "group",
      "go",
      "because",
      "b/c",
      "get",
      "put",
      "it",
      `it's`,
      "i",
      "I",
      "me",
      "my",
      "myself",
      "we",
      "-",
      "us",
      "our",
      "ours",
      "ourselves",
      "you",
      "your",
      "yours",
      "yourself",
      "yourselves",
      "he",
      "him",
      "his",
      "himself",
      "she",
      "her",
      "hers",
      "herself",
      "it",
      "its",
      "itself",
      "they",
      "them",
      "their",
      "theirs",
      "themselves",
      "what",
      "which",
      "who",
      "whom",
      "whose",
      "this",
      "that",
      "these",
      "those",
      "am",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "having",
      "do",
      "does",
      "did",
      "doing",
      "will",
      "would",
      "should",
      "can",
      "could",
      "ought",
      "a",
      "an",
      "the",
      "and",
      "but",
      "if",
      "or",
      "because",
      "as",
      "until",
      "while",
      "of",
      "at",
      "by",
      "for",
      "with",
      "about",
      "against",
      "between",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "to",
      "from",
      "up",
      "upon",
      "down",
      "in",
      "out",
      "on",
      "off",
      "over",
      "under",
      "again",
      "further",
      "then",
      "once",
      "here",
      "there",
      "when",
      "where",
      "why",
      "ho w",
      "all",
      "any",
      "both",
      "each",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "no",
      "nor",
      "not",
      "only",
      "own",
      "same",
      "so",
      "than",
      "too",
      "very",
      "say",
      "says",
      "said",
      "shall",
    ];
    let filteredArrayCharacters = words.map((wordCloudText) =>
      wordCloudText.replace(/[.,()]/g, "")
    );
    let finishedArray = filteredArrayCharacters.map((v) => v.toLowerCase());
    finishedArray = finishedArray.filter(function (word) {
      return !stopWords.includes(word);
    });

    return finishedArray;
  }

  ngOnInit() {
    if (this.averages === null || this.averages === undefined) {
      return null;
    } else {
      this.radarChartData = this.averages.map((e) => e.toFixed(0));
    }
    this.radarChartLabels = this.labels;

    let lastArray: number[] = this.data[this.data.length - 1];

    let filteredArray = this.filterWords(lastArray);

    let data = d3
      .rollups(
        filteredArray,
        (group) => group.length,
        (w) => w
      )
      .sort(([, a], [, b]) => d3.descending(a, b))
      .slice(0, 250)
      .map(([text, value]) => ({ text, value }));

    let highestValue;
    // check if user inputted general notes to populate word cloud
    if (data.length == 0) {
      console.log("word cloud data is undefined");
    } else {
      highestValue = data[0].value;
    }

    // function for sentiment analysis values
    this.wordCloudText = data.map(function (wordCloudData) {
      const sentiment = new Sentiment();
      let intensity = sentiment.analyze(wordCloudData.text);
      let intensityValue;
      if (intensity >= 0.1) {
        intensityValue = "positive";
      } else if (intensity <= -0.1) {
        intensityValue = "negative";
      } else if (intensity > -0.1 && intensity < 0.1) {
        intensityValue = "neutral";
      }
      return {
        text: wordCloudData.text,
        value: 15 + (wordCloudData.value / highestValue) * 20,
        index: intensityValue,
      };
    });
  }
  getAverageOfScores = (scores: number[]) => {
    if (scores === null || scores === undefined) {
      return null;
    } else {
      return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(0);
    }
  };

  createChart() {
    this.chart = new Chart("MyChart", {
      type: "radar", //this denotes tha type of chart
      data: {
        // values on X-Axis
        labels: this.labels,
        datasets: [
          {
            data: this.averages,
            label: this.diagnosticTitle,
            backgroundColor: "rgba(0, 166, 181, .2)",
            borderColor: "#00a6b5",
            pointBorderColor: "white",
            pointBackgroundColor: "#00a6b5",
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: "Aggregate Theme Breakdown",
          fontsize: 30,
        },
        onClick: (c, i: any) => {
          // function to run when a data point is clicked
          if (!i[0]) {
            this.current_clicked_index = -1;
            // this.createWordCloud;
            return;
          }
          this.current_clicked_index = i[0]._index;

          this.current_hovered_total_percentage =
            this.radarChartData[this.current_clicked_index];
          this.current_hovered_title =
            this.radarChartLabels[this.current_clicked_index];

          // initialize hashmap for
          const capability_map: Map<string, number[]> = new Map();

          // loop through scorecards and map capabilites
          this.generatedScoreCards[this.current_clicked_index].capabilities.map(
            (capability) => {
              // add maturity score to the capability
              if (capability_map.has(capability.title)) {
                let score_array = capability_map.get(capability.title);
                score_array.push(capability.maturity);
                capability_map.set(capability.title, score_array);
                // create a new capability if one didn't already exist in the map with a new score_array
              } else {
                let score_array: number[] = [];
                score_array.push(capability.maturity);
                capability_map.set(capability.title, score_array);
              }
            }
          );

          //word cloud functionality

          let chosenArray: number[] = this.data[this.current_clicked_index];
          let filteredArray = this.filterWords(chosenArray);

          let data = d3
            .rollups(
              filteredArray,
              (group) => group.length,
              (w) => w
            )
            .sort(([, a], [, b]) => d3.descending(a, b))
            .slice(0, 250)
            .map(([text, value]) => ({ text, value }));

          console.log("data clicked", data);
          let highestValue = data[0].value;

          //getting sentiment analysis values
          this.wordCloudTextTheme = data.map(function (wordCloudData) {
            const sentiment = new Sentiment();
            let intensity = sentiment.analyze(wordCloudData.text);
            let intensityValue;
            if (intensity >= 0.1) {
              intensityValue = "positive";
            } else if (intensity <= -0.1) {
              intensityValue = "negative";
            } else if (intensity > -0.1 && intensity < 0.1) {
              intensityValue = "neutral";
            }
            return {
              text: wordCloudData.text,
              value: 15 + (wordCloudData.value / highestValue) * 20,
              index: intensityValue,
            };
          });

          this.capability_map = capability_map;

          // get the capabilites and averages from the map and using the getAverageScore()
          let all_capabilities_and_averages: string[] = [];
          capability_map.forEach((value, key) => {
            all_capabilities_and_averages.push(
              `${key}: ${this.getAverageOfScores(value)}%`
            );
          });

          // return all teh capabilites and averages
          return all_capabilities_and_averages;
        },
        // tool tips controls the view of when you hover over a data point
        tooltips: {
          callbacks: {
            // change label title
            title: (tooltipItem) => {
              const title = this.radarChartLabels[tooltipItem[0].index];
              const average_percentage =
                this.radarChartData[tooltipItem[0].index];

              return `${title}: ${average_percentage}%`;
            },
            // change label content
            label: (tooltipItem, data) => {
              // initialize hashmap for
              const capability_map: Map<string, number[]> = new Map();

              // loop through scorecards and map capabilites
              this.generatedScoreCards[tooltipItem.index].capabilities.map(
                (capability) => {
                  // add maturity score to the capability
                  if (capability_map.has(capability.title)) {
                    let score_array = capability_map.get(capability.title);
                    score_array.push(capability.maturity);
                    capability_map.set(capability.title, score_array);
                    // create a new capability if one didn't already exist in the map with a new score_array
                  } else {
                    let score_array: number[] = [];
                    score_array.push(capability.maturity);
                    capability_map.set(capability.title, score_array);
                  }
                }
              );

              // get the capabilites and averages from the map and using the getAverageScore()
              let all_capabilities_and_averages: string[] = [];
              capability_map.forEach((value, key) => {
                all_capabilities_and_averages.push(
                  `${key}: ${this.getAverageOfScores(value)}%`
                );
              });

              // return all teh capabilites and averages
              return all_capabilities_and_averages;
            },
          },
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        scale: {
          pointLabels: {
            fontSize: 16,
          },
          ticks: {
            callback: function (value, index, values) {
              return value + "%";
            },
            beginAtZero: true,
            max: 100,
            stepSize: 25,
          },
        },
        legend: {
          display: false,
        },
      },
    });
  }
}
