import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Question, Theme, Swot, Response, Diagnostic, UserDiagnosticData, User } from '../../_models/http_resource';
import { DataService } from '../../_services/data.service';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-diagnostic-dx-notes-modal',
  templateUrl: './diagnostic-dx-notes-modal.component.html',
  styleUrls: ['./diagnostic-dx-notes-modal.component.css']
})
export class DiagnosticDXNotesModalComponent implements OnInit, OnDestroy {

  userId;
  diagnosticId;
  diagnostic: Diagnostic;
  userData: UserDiagnosticData;
  user: User;
  themes: Theme[];
  questions: Question[][] = [];
  responses: Response[][] = [];
  swot: Swot;

  toolbarOptions = [
    ['bold', 'italic', 'underline' ],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [ 'link' ],
  ];

  editorOptions = {
    toolbar: this.toolbarOptions
  };

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
    private titleService: Title,
    public dialogRef: MatDialogRef<DiagnosticDXNotesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDiagnosticData,
  ) { }

  ngOnInit() {
    // this.userId = localStorage.getItem('diagnosticUser');

    // this.diagnosticId = this.route.snapshot.paramMap.get('diagid');
    // this.dataService.getDiagnostic(this.diagnosticId).subscribe(diagnostic => {

    //   if (diagnostic.lock === true && window.location.href.indexOf("http://localhost") !== 0) {
    //     alert('A user is currently editing this diagnostic. Try again later');
    //     this.router.navigate(['/dashboard']);
    //   }

    //   this.diagnostic = JSON.parse(JSON.stringify(diagnostic));

    //   if (diagnostic === null) {
    //     this.router.navigate(['not-found']);
    //   } else {
    //     // Add diagnosticId to user's diagnostics object
    //     this.dataService.getUser(this.userId).subscribe(user => {
    //       this.user = user;
    //       this.dataService.addDiagnosticToUser(this.diagnosticId, this.user);
    //     });

    //     this.themes = this.diagnostic.themes;

    //     if (!this.getUserData()) {
    //       this.createUserEntry();
    //     }

    //     this.userData = this.getUserData();

    //     this.titleService.setTitle('Diagnostic - ' + this.diagnostic.title);
    //   }
    // });
  }

  createUserEntry() {
    // const userData = new UserDiagnosticData();

    // userData.userId = this.userId;
    // userData.currentTheme = 0;
    // userData.currentQuestions = new Array(this.diagnostic.themes.length).fill(0);

    // for (let i = 0; i < this.diagnostic.themes.length; i++) {
    //   userData.responses.push([]);
    //   for (let j = 0; j < this.diagnostic.themes[i].questions.length; j++) {
    //     userData.responses[i].push(new Response());
    //   }
    // }

    // this.diagnostic.userData.push(userData);

    // // Make sure to update immediately after
    // this.dataService.updateDiagnostic(this.diagnostic);
  }

  close() {
    this.dialogRef.close(this.data.diagnosticNotes);
  }

  // diagnosticUpdate(e) {
  //   this.diagnostic = e;
  //   this.updateResponse();
  // }

  // updateResponse() {
  //   this.dataService.getDiagnostic(this.diagnosticId).subscribe(diagnostic => {

  //     // If the diagnostic is in the middle of being edited while we make an update, do not finish the update and navigate to dashboard
  //     if (diagnostic.lock === true) {
  //       alert('A user is currently editing this diagnostic. Your last action was not saved. Try again later');
  //       this.router.navigate(['/dashboard']);
  //     } else {
  //       let count = 0;
  //       for (const userData of diagnostic.userData) {
  //         if (userData.userId === this.userId) {

  //           diagnostic.userData[count] = this.getUserData();
  //           this.diagnostic = JSON.parse(JSON.stringify(diagnostic));
  //           this.dataService.updateDiagnostic(this.diagnostic);
  //         }
  //         count++;
  //       }
  //     }
  //   });
  // }

  ngOnDestroy() {
    this.close();
  }

  // getUserData() {
  //   for (const userData of this.diagnostic.userData) {
  //     if (userData.userId === this.userId) {
  //       return userData;
  //     }
  //   }
  //   return null;
  // }
}
