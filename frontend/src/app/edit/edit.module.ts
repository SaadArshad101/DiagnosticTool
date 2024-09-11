import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditComponent } from './edit.component';
import { QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AutofocusDirective } from '../_helpers/autoFocus';

@NgModule({
  declarations: [
    EditComponent,
    AutofocusDirective
  ],
  imports: [
    CommonModule,
    QuillModule.forRoot(),
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports: [
    EditComponent
  ]
})
export class EditModule { }