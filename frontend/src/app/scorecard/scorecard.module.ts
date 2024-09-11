import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScorecardComponent } from './scorecard.component';
import { MimicInputComponent } from '../theme-designer/mimic-input/mimic-input.component';
import { EditModule } from '../edit/edit.module';
import { QuillModule } from 'ngx-quill';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    ScorecardComponent,
  ],
  imports: [
    CommonModule,
    EditModule,
    QuillModule.forRoot(),
    MatSelectModule
  ],
  exports: [
    ScorecardComponent
  ]
})
export class ScorecardModule { }
