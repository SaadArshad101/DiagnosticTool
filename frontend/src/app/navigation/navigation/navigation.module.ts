import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from '../navigation.component';
import { AppRoutingModule } from '../../app-routing.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { EditModule } from 'src/app/edit/edit.module';

@NgModule({
  declarations: [
    NavigationComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    MatCheckboxModule,
    FormsModule,
    EditModule
  ],
  exports: [
    NavigationComponent,
  ],
})
export class NavigationModule { }
