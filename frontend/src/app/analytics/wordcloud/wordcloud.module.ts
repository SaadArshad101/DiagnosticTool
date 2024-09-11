import { NgModule } from '@angular/core';
import { AngularD3CloudModule } from 'angular-d3-cloud'
import { WordCloudComponent } from './wordcloud.component';

@NgModule({
    imports: [AngularD3CloudModule],
    declarations:[WordCloudComponent],
    exports:[WordCloudComponent]
})
export class WordCloudModule{}