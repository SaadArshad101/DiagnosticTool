import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatRadioModule} from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ThemeRoutingModule } from './theme-completion/theme-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { QuillModule } from 'ngx-quill';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatToolbarModule} from '@angular/material/toolbar';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ngfModule } from 'angular-file';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatDialogModule } from '@angular/material/dialog';
import { NgbPaginationModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthInterceptorService } from './_services/auth-interceptor.service';
import { JwtModule } from '@auth0/angular-jwt';
import { BnNgIdleService } from 'bn-ng-idle';

import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { Ng2DeepSearchPipe } from './_helpers/deepSearchPipe';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LogoutComponent } from './logout/logout.component';
import { NotAuthenticatedComponent } from './not-authenticated/not-authenticated.component';
import { ThemeDesignerComponent } from './theme-designer/theme-designer.component';
import { ThemeCompletionModule } from './theme-completion/theme-completion.module';
import { NavigationModule } from './navigation/navigation/navigation.module';
import { MimicInputComponent } from './theme-designer/mimic-input/mimic-input.component';
import { SamlComponent } from './login/saml/saml.component';
import { ChangeProfileComponent } from './change-profile/change-profile.component';
import { TemplateBankComponent } from './dashboard/template-bank/template-bank.component';
import { TemplateCardComponent } from './dashboard/template-bank/template-card/template-card.component';
import { TemplateManagementComponent } from './dashboard/template-management/template-management.component';
import { UserManagementComponent } from './dashboard/user-management/user-management.component';
import { DiagnosticManagementComponent } from './dashboard/diagnostic-management/diagnostic-management.component';
import { DialogComponent } from './_services/dialog/dialog.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { TagInputModule } from 'ngx-chips';
import { RadarChartComponent } from './analytics/radarchart/radarchart.component'; 
import { RadarChartModule } from './analytics/radarchart/radarchart.module';
import { WordCloudModule } from './analytics/wordcloud/wordcloud.module';

import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';
import { NotificationMessageComponent } from './_services/notification-message/notification-message.component';
import { CanDeactivateGuard } from './_services/can-deactivate-guard.service';
import { ScorecardModule } from './scorecard/scorecard.module';
import { ImportModalComponent } from './dashboard/import-modal/import-modal.component';
import { EditModule } from './edit/edit.module';
import { SettingsModalComponent } from './navigation/settings-modal/settings-modal.component';
import { NestableModule } from 'ngx-nestable';
import { ChangeAccountComponent } from './change-account/change-account.component';
import { SharePopoverComponent } from './dashboard/diagnostic-management/share-popover/share-popover.component';
import { RecInventoryModule } from './rec-inventory/rec-inventory.module';

PlotlyModule.plotlyjs = PlotlyJS;

export function tokenGetter() {
  return localStorage.getItem('jwt');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    LogoutComponent,
    NotAuthenticatedComponent,
    ThemeDesignerComponent,
    MimicInputComponent,
    SamlComponent,
    ChangeProfileComponent,
    TemplateBankComponent,
    TemplateCardComponent,
    TemplateManagementComponent,
    UserManagementComponent,
    DiagnosticManagementComponent,
    DialogComponent,
    NotFoundComponent,
    NotAuthorizedComponent,
    AnalyticsComponent,
    Ng2DeepSearchPipe,
    NotificationMessageComponent,
    ImportModalComponent,
    SettingsModalComponent,
    ChangeAccountComponent,
    SharePopoverComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatExpansionModule,
    MatCardModule,
    ThemeRoutingModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatInputModule,
    MatTableModule,
    MatSnackBarModule,
    ThemeCompletionModule,
    HttpClientModule,
    MatTabsModule,
    QuillModule.forRoot(),
    NavigationModule,
    DragDropModule,
    MatToolbarModule,
    ngfModule,
    MatCheckboxModule,
    MatSelectModule,
    ScrollingModule,
    MatDialogModule,
    NgbPaginationModule,
    TagInputModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
      }
    }),
    PlotlyModule,
    Ng2SearchPipeModule,
    ScorecardModule,
    EditModule,
    NestableModule,
    NgbPopoverModule,
    MatAutocompleteModule,
    RecInventoryModule,
    RadarChartModule,
    WordCloudModule
  ],
  entryComponents: [
    TemplateBankComponent, 
    DialogComponent, 
    NotificationMessageComponent, 
    ImportModalComponent, 
    SettingsModalComponent],
  providers: [
    BnNgIdleService,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true},
    CanDeactivateGuard,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }