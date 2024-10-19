import { Injectable } from '@angular/core';
import { DiagnosticService, UserService, TemplateService, DefaultDiagnosticService, TagService } from './resource.service';
import { ResponseService } from './response.service';
import { Diagnostic, User, Template, DefaultDiagnostic, Tag, Theme, Answer, UserDiagnosticData } from '../_models/http_resource';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { v4 as uuid } from 'uuid';
import { map, catchError } from 'rxjs/operators';

const apiUrl = environment.apiUrl;
const loginEndpoint = environment.loginEndpoint;
const loginSAMLEndpoint = environment.loginSAMLEndpoint;

const loginUrl = apiUrl + '/' + loginEndpoint;

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private diagnosticService: DiagnosticService,
    private userService: UserService,
    private templateService: TemplateService,
    private router: Router,
    private defaultDiagnosticService: DefaultDiagnosticService,
    private tagService: TagService,
    private http: HttpClient,
    private responseService: ResponseService
  ) { }

  getUser(id: string) {
    return this.userService.read(id);
  }

  getDiagnostic(id: string) {
    return this.diagnosticService.read(id).pipe(
      map(diagnostic => this.addIdsToDiagnosticFields(diagnostic))
    );
  }

  getAllDiagnostics() {
    return this.diagnosticService.readAll();
  }

  getDiagnosticObservable(id: string) {
    return this.diagnosticService.read(id);
  }

  getAllUsers() {
    return this.userService.readAll();
  }

  addUser(user: User = new User()) {
    return this.userService.create(user);
  }

  deleteUser(id) {
    return this.userService.delete(id);
  }

  // Proposed implementation for delete user - DP 08/15/2019
  // deleteUser(id) {
  //   this.userService.delete(id)
  //     .subscribe(s => {},
  //       (err => {
  //         if (err.status === 404) {
  //           alert('This resource was not found');
  //           this.router.navigate(['not-found']);
  //         }
  //         // Add conditional logic for all other error response codes we directly handle
  //         else {
  //           return err.status;
  //         }
  //       })
  //     );
  // }

  updateUser(user: User) {
    this.userService.update(user).subscribe(s => {}, (err => {
      if (err.status === 404) {
        alert('This resource was not found');
      }
      else if(err.status === 403) {
        this.router.navigate(['not-authorized']);
      }
      // Add conditional logic for all other error response codes we directly handle
      else {
        return err.status;
      }
    }));
  }

  updateDiagnostic(diagnostic: Diagnostic) {
    this.diagnosticService.update(diagnostic).subscribe(s => {}, (err => {
      if (err.status === 404) {
        alert('This resource was not found');
      }
      else if(err.status === 403) {
        this.router.navigate(['not-authorized']);
      }
      // Add conditional logic for all other error response codes we directly handle
      else {
        return err.status;
      }
    }));
  }

  webSocUpdateDiagnostic(diagnostic: Diagnostic) {
    this.diagnosticService.webSocUpdate(diagnostic);
  }

  onWebSocDiagnosticUpdate() {
    return this.diagnosticService.onDiagnosticUpdate();
  }

  addDiagnostic(user: User, diagnosticInput: Diagnostic = new Diagnostic()) {
    // This is to make sure that any diagnostics added will have properly generated ids for themes, questions and answers
    // so that taking a diagnostic works
    this.addIdsToDiagnosticFields(diagnosticInput);

    if (!diagnosticInput.owners) {
      diagnosticInput.owners = [];
    }

    diagnosticInput.owners.push(user.id);

    return this.diagnosticService.create(diagnosticInput);
  }

  addIdsToDiagnosticFields(diagnostic: Diagnostic) {
    for (const theme of diagnostic.themes) {
      if (!theme.id) {
        // clear the userData if there exists a theme without an id
        diagnostic.userData = [];
        theme.id = uuid();
      }
      this.addIdsToQuestionsAndAnswers(theme);
    }

    return diagnostic;
  }

  addIdsToQuestionsAndAnswers(theme: Theme) {
    let queue = theme.questions;

    while (queue && queue.length > 0) {
      let children = [];

      for (const question of queue) {
        if (!question.id) {
          question.id = uuid();
        }

        for (const answer of question.answers) {
          if (!answer.id) {
            answer.id = uuid();
          }
        }

        if (question['children'] && question['children'].length > 0) {
          children.push(question['children']);
        }

        children = children.flat();
      }

      queue = children;
    }
  }

  addDiagnosticToUser(diagnosticId: string, user: User) {
    if (!user.diagnostics.includes(diagnosticId)) {
      user.diagnostics.push(diagnosticId);
      this.updateUser(user);
    }
  }

  deleteDiagnostic(diagnosticId: string) {
    this.diagnosticService.delete(diagnosticId).subscribe(s => {}, (err => {
      if (err.status === 404) {
        alert('This resource was not found');
        this.router.navigate(['not-found']);
      }
      else if(err.status === 403) {
        this.router.navigate(['not-authorized']);
      }
      // Add conditional logic for all other error response codes we directly handle
      else {
        console.log(err);
        return err.status;
      }
    }));
  }

  checkLogin(user: User) {
    return this.http
    .post(loginUrl, {email: user.email, password: user.password });
  }

  redirectSSO() {
    return this.http.get(loginSAMLEndpoint);
  }

  addTemplate(template: Template = new Template()) {
    return this.templateService.create(template);
  }

  deleteTemplate(id) {
    return this.templateService.delete(id);
  }

  getTemplate(id: string) {
    return this.templateService.read(id);
  }

  getAllTemplates() {
    return this.templateService.readAll();
  }

  updateTemplate(template: Template) {
    return this.templateService.update(template);
  }

  convertDiagnosticToTemplate(diagnostic: Diagnostic) {
    const template = new Template;

    const copy = JSON.parse(JSON.stringify(diagnostic));

    // Clear any user specific data before storing as template
    copy.userData = [];
    copy.owners = [];

    template.diagnostic = copy;
    template.title = copy.title;
    template.subtitle = copy.text;

    return template;
  }

  getAllDefaultDiagnostics() {
    return this.defaultDiagnosticService.readAll();
  }

  addDefaultDiagnostic(defaultDiagnostic: DefaultDiagnostic) {
    return this.defaultDiagnosticService.create(defaultDiagnostic);
  }

  removeDefaultDiagnostic(diagnosticId: string) {
    return this.defaultDiagnosticService.delete(diagnosticId);
  }

  getAllTags() {
    return this.tagService.readAll();
  }

  addTag(tag: Tag) {
    return this.tagService.create(tag);
  }

  // If the diagnostic doesn't have userDiagnosticData for the current user, make an entry to store in the database.
  createUserEntry(id, diagnostic) {
    const userData = new UserDiagnosticData();

    userData.userId = id;
    userData.currentTheme = diagnostic.themes[0].id;

    this.addResponseEntries(userData, diagnostic);
    this.addCurrentQuestionEntries(userData, diagnostic);

    diagnostic.userData.push(userData);

    // Make sure to update immediately after
    this.updateDiagnostic(diagnostic);
  }

  // Add an empty response object for each question that does not already have an entry in responses
  addResponseEntries(userData: UserDiagnosticData, diagnostic) {
    for (const theme of diagnostic.themes) {
      for (const question of theme.questions) {
        if (!userData.responses[question.id]) {
          userData.responses[question.id] = new Response();
        }
      }
    }
  }

  // Add the first question's id as the currentQuestion of each theme that does not already have an entry in currentQuestions
  addCurrentQuestionEntries(userData: UserDiagnosticData, diagnostic) {
    for (const theme of diagnostic.themes) {
      if (!userData.currentQuestions[theme.id]) {
        if (theme.questions.length > 0) {
          userData.currentQuestions[theme.id] = theme.questions[0].id;
        } else {
          userData.currentQuestions[theme.id] = '';
        }
      }
    }
  }
}
