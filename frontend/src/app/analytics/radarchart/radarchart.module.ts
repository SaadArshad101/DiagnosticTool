import { NgModule } from "@angular/core";
import { RadarChartComponent } from "./radarchart.component";
import { BrowserModule } from "@angular/platform-browser";
import { AngularD3CloudModule } from 'angular-d3-cloud'

@NgModule({
    declarations:[RadarChartComponent],
    imports:[BrowserModule, AngularD3CloudModule],
    exports: [RadarChartComponent]
})
export class RadarChartModule{}

