import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogoutComponent } from './logout/logout.component';
import { NotAuthenticatedComponent } from './not-authenticated/not-authenticated.component';
import { ChangeProfileComponent } from './change-profile/change-profile.component';
import { ThemeDesignerComponent } from './theme-designer/theme-designer.component';
import { SamlComponent } from './login/saml/saml.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AuthGuard } from './_services/auth-guard';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { CanDeactivateGuard } from './_services/can-deactivate-guard.service';
import { ChangeAccountComponent } from './change-account/change-account.component';

// Auth guard is for checking if jwt is expired

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'logout' , component: LogoutComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'not-authenticated', component: NotAuthenticatedComponent },
  { path: 'change-profile', component: ChangeProfileComponent, canActivate: [AuthGuard] },
  { path: 'diagnostic/:diagid/designer-landing', redirectTo: 'diagnostic/:diagid/diagnostic-editor'},
  { path: 'diagnostic/:diagid/diagnostic-editor', component: ThemeDesignerComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard]},
  { path: 'saml/:jwt', component: SamlComponent},
  { path: 'diagnostic/:diagid/preview', component: ThemeDesignerComponent, canActivate: [AuthGuard]},
  { path: 'diagnostic/:diagid/adminPreview', component: ThemeDesignerComponent, canActivate: [AuthGuard]},
  { path: 'not-found', component: NotFoundComponent },
  { path: 'not-authorized', component: NotAuthorizedComponent },
  { path: 'analytics/:diagid', component: AnalyticsComponent},
  { path: 'change-account', component: ChangeAccountComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
