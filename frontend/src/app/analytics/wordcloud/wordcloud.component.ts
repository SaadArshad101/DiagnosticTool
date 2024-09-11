import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
} from "@angular/core";
import * as d3 from "d3";

@Component({
  selector: "word-cloud",
  templateUrl: "./wordcloud.component.html",
  styleUrls: ["./wordcloud.component.css"],
})
export class WordCloudComponent implements AfterViewInit {
  @Input() data;
  public wordCloudData: any;
  constructor(private cdr: ChangeDetectorRef) {}
  ngAfterViewInit(): void {
    this.createWordCloud();
    this.cdr.detectChanges();
  }

  createWordCloud() {
    this.wordCloudData = [this.data].map(function (d) {
      return { text: d, value: 10 + Math.random() * 90 };
    });
    // console.log("The words here are: " + this.data);
    // console.dir(this.data);
    const objectString = JSON.stringify(this.data, null, 2);
    // console.log(objectString);
  }
}
