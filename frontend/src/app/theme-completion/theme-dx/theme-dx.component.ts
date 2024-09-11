import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Question, Theme, Swot, Response, Diagnostic, UserDiagnosticData, User, Answer } from '../../_models/http_resource';
import { DataService } from '../../_services/data.service';
import { ResponseService } from '../../_services/response.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-theme-dx',
  templateUrl: './theme-dx.component.html',
  styles: ['./theme-dx.component.css'],
})

export class ThemeDXComponent implements OnInit {

  userId;
  diagnosticId;

  currentThemeIndex = 0;
  currentQuestionIndex;

  user: User;
  diagnostic: Diagnostic;
  themes: Theme[];
  userData: UserDiagnosticData;
  questions: Question[][] = [];
  responses: Response[][] = [];
  swot: Swot;

    // Object has 2 fields:
  // question: the question object
  // depth: original depth of the question. depth 1 is the root level.
  flattenedQuestionMap: Map<string, Object[]>;

  // This can have ids be repeated in the cases where they are skipped more than once
  disabledQuestionIds: string[];

  constructor(private route: ActivatedRoute,
    private dataService: DataService,
    private responseService: ResponseService,
    private titleService: Title,
    private router: Router) { }

  ngOnInit() {
    this.userId = localStorage.getItem('diagnosticUser');

    this.diagnosticId = this.route.snapshot.paramMap.get('diagid');
    this.dataService.getDiagnostic(this.diagnosticId).subscribe(diagnostic => {

      if (diagnostic.lock === true && window.location.href.indexOf("http://localhost") !== 0) {
        alert('A user is currently editing this diagnostic. Try again later');
        this.router.navigate(['/dashboard']);
      }

      this.diagnostic = JSON.parse(JSON.stringify(diagnostic));

      if (diagnostic === null) {
        this.router.navigate(['not-found']);
      } else {
        // Add diagnosticId to user's diagnostics object
        this.dataService.getUser(this.userId).subscribe(user => {
          this.user = user;
          this.dataService.addDiagnosticToUser(this.diagnosticId, this.user);
        });

        if (!this.getUserData()) {
          this.createUserEntry();
        }

        this.userData = this.getUserData();

        this.flattenedQuestionMap = new Map<string, Object[]>();
        this.disabledQuestionIds = [];

        this.flattenedQuestionMap = this.responseService.getFlattenQuestionsMap(this.diagnostic);
        this.addResponseEntries(this.userData);
        this.addCurrentQuestionEntries(this.userData);
        this.disabledQuestionIds = this.responseService.
          getDisabledQuestions(this.diagnostic, this.flattenedQuestionMap, this.getUserData());

        this.titleService.setTitle('Diagnostic - ' + this.diagnostic.title);
      }
    });
  }

  // If the diagnostic doesn't have userDiagnosticData for the current user, make an entry to store in the database.
  createUserEntry() {
    const userData = new UserDiagnosticData();

    userData.userId = this.userId;
    userData.currentTheme = this.diagnostic.themes[0].id;

    this.addResponseEntries(userData);
    this.addCurrentQuestionEntries(userData);

    this.diagnostic.userData.push(userData);

    // Make sure to update immediately after
    this.dataService.updateDiagnostic(this.diagnostic);
    this.dataService.getDiagnostic(this.diagnosticId).subscribe(diag => { });
  }

  // Add an empty response object for each question that does not already have an entry in responses
  addResponseEntries(userData: UserDiagnosticData) {
    for (const theme of this.diagnostic.themes) {
      for (const question of theme.questions) {
        if (!userData.responses[question.id]) {
          userData.responses[question.id] = new Response();
        }
      }
    }
  }

  // Add the first question's id as the currentQuestion of each theme that does not already have an entry in currentQuestions
  addCurrentQuestionEntries(userData: UserDiagnosticData) {
    for (const theme of this.diagnostic.themes) {
      if (!userData.currentQuestions[theme.id]) {
        if (theme.questions.length > 0) {
          userData.currentQuestions[theme.id] = theme.questions[0].id;
        } else {
          userData.currentQuestions[theme.id] = '';
        }
      }
    }
  }

  newQuestionSelected(e) {
    this.getUserData().currentQuestions[this.getUserData().currentTheme] = e.id;
    this.updateResponse();
  }

  diagnosticUpdate(e) {
    this.diagnostic = e;
    this.updateResponse();
  }

  newThemeSelected(e) {
    this.getUserData().currentTheme = e;
    this.updateResponse();
  }

  // This updates the diagnostic object by pulling the latest version from the database and then replacing
  // the userData object specific to the user with whats currently on the page
  updateResponse() {
    this.dataService.getDiagnostic(this.diagnosticId).subscribe(diagnostic => {

      // If the diagnostic is in the middle of being edited while we make an update, do not finish the update and navigate to dashboard
      if (diagnostic.lock === true) {
        alert('A user is currently editing this diagnostic. Your last action was not saved. Try again later');
        this.router.navigate(['/dashboard']);
      } else {
        let count = 0;
        for (const userData of diagnostic.userData) {
          if (userData.userId === this.userId) {

            diagnostic.userData[count] = this.getUserData();
            this.diagnostic = JSON.parse(JSON.stringify(diagnostic));
            this.dataService.updateDiagnostic(this.diagnostic);
          }
          count++;
        }
      }
    });
  }

  navigateToReport(e) {
    const reportLink = '../../report/' + this.diagnostic.id;

    this.router.navigate([reportLink]);
  }

  getUserData() {
    for (const userData of this.diagnostic.userData) {
      if (userData.userId === this.userId) {
        return userData;
      }
    }
    return null;
  }
}

