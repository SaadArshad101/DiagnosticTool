import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecInventoryComponent } from './rec-inventory.component';
import { ImplRoadmapComponent } from '../impl-roadmap/impl-roadmap.component';
import { MatTabsModule, MatSelectModule } from '@angular/material';
import { EditModule } from '../edit/edit.module';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    RecInventoryComponent,
    ImplRoadmapComponent
  ],
  imports: [
    CommonModule,
    MatSelectModule,
    MatTabsModule,
    EditModule,
    FormsModule,
    DragDropModule
  ],
  exports: [
    RecInventoryComponent,
    ImplRoadmapComponent
  ]
})
export class RecInventoryModule { }
