import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../_services/auth-guard';

import { ThemeComponent } from './theme/theme.component';
import { ResultsComponent } from './results/results.component';


const themeRoutes: Routes = [
  { path: 'diagnostic/:diagid', component: ThemeComponent, canActivate: [AuthGuard] },
  { path: 'report/:diagid', component: ResultsComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [
    RouterModule.forChild(themeRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ThemeRoutingModule { }
