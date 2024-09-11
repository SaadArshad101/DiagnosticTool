import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule, MatTab } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule} from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ThemeComponent } from './theme/theme.component';
import { ThemeDXComponent } from './theme-dx/theme-dx.component';
import { SwotComponent } from './swot/swot.component';
import { EditableListComponent } from './swot/editable-list/editable-list.component';
import { ResultsComponent } from './results/results.component';
import { ThemeRoutingModule } from './theme-routing.module';
import { ThemeQuestionNavComponent } from './theme-question-nav/theme-question-nav.component';
import { ThemeQuestionDisplayComponent } from './theme-question-display/theme-question-display.component';
import { ThemeDXQuestionDisplayComponent } from './theme-dx-question-display/theme-dx-question-display.component';
import { ThemeNavComponent } from './theme-nav/theme-nav.component';
import { QuillModule } from 'ngx-quill';
import { ThemeDXNavComponent } from './theme-dx-nav/theme-dx-nav.component';
import { NavigationModule } from '../navigation/navigation/navigation.module';
import { ChartsModule } from 'ng2-charts';
import { ScorecardModule } from '../scorecard/scorecard.module';
import { ScorecardComponent } from '../scorecard/scorecard.component';
import { DiagnosticNotesModalComponent } from './diagnostic-notes-modal/diagnostic-notes-modal.component';
import { DiagnosticDXNotesModalComponent } from './diagnostic-dx-notes-modal/diagnostic-dx-notes-modal.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { RecInventoryModule } from '../rec-inventory/rec-inventory.module';
import { RadarChartModule } from '../analytics/radarchart/radarchart.module';
import { WordCloudModule } from '../analytics/wordcloud/wordcloud.module';


@NgModule({
  declarations: [
    ThemeComponent,
    ThemeDXComponent,
    EditableListComponent,
    SwotComponent,
    ResultsComponent,
    ThemeQuestionNavComponent,
    ThemeQuestionDisplayComponent,
    ThemeDXQuestionDisplayComponent,
    ThemeNavComponent,
    ThemeDXNavComponent,
    DiagnosticNotesModalComponent,
    DiagnosticDXNotesModalComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatExpansionModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    ThemeRoutingModule,
    MatTabsModule,
    QuillModule.forRoot(),
    NavigationModule,
    ChartsModule,
    ScorecardModule,
    DragDropModule,
    MatDialogModule,
    RecInventoryModule, 
    RadarChartModule,
    WordCloudModule
  ],
  entryComponents: [
    DiagnosticNotesModalComponent,
    DiagnosticDXNotesModalComponent
  ],
  providers: [
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: [] },
  ]
})
export class ThemeCompletionModule { }
