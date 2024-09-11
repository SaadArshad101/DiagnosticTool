import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../_services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { SettingsModalComponent } from './settings-modal/settings-modal.component';
import { Diagnostic } from '../_models/http_resource';

//import { UserService } from '../_services/dashboard.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  @Input() middleText: string;
  @Input() isEditor = false;
  @Input() diagnostic: Diagnostic;
  // @Input() diagnosticEmails = []; // For settings dialog mass add users
  // @Input() bentoInput: boolean;
  // @Input() dxInput: boolean;
  // @Input() swotverticalInput: boolean;
  // @Input() reportInput: boolean;
  // @Input() scorecardInput: boolean;
  // @Input() roadmapInput: boolean;
  // @Input() editDiagnostic;


  // @Output() bentoEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Output() dxEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Output() swotverticalEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Output() reportEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Output() scorecardEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Output() roadmapEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() diagnosticEmitter: EventEmitter<Diagnostic> = new EventEmitter<Diagnostic>();

  firstName: string;

  constructor(
    private dataService: DataService,
    private dialog: MatDialog
  ) { }

  isLoggedIn() {
    return localStorage.getItem('diagnosticUser');
  }

  openSettingsDialog() {
    // const emailsEmitter = new EventEmitter<boolean>();

    const dialogRef = this.dialog.open(SettingsModalComponent, {
      data: {
        diagnostic: this.diagnostic
        // bentoInput: this.bentoInput,
        // dxInput: this.dxInput,
        // swotverticalInput: this.swotverticalInput,
        // reportInput: this.reportInput,
        // scorecardInput: this.scorecardInput,
        // roadmapInput: this.roadmapInput,
        // bentoEmitter: this.bentoEmitter,
        // dxEmitter: this.dxEmitter,
        // swotverticalEmitter: this.swotverticalEmitter,
        // reportEmitter: this.reportEmitter,
        // scorecardEmitter: this.scorecardEmitter,
        // roadmapEmitter: this.roadmapEmitter,
        // emailsEmitter: emailsEmitter,
        // diagnosticId: this.editDiagnostic.id
      }
    });

    // dialogRef.afterClosed().subscribe(diagnostic => {
    //   console.log(diagnostic);
    //   this.diagnosticEmitter.emit(diagnostic);
    // });

    // emailsEmitter.subscribe(() => this.addEmails(dialogRef.componentInstance.emails));
  }

  addEmails(emails: Set<string>) {
    let associatedEmails = this.diagnostic.associatedEmails;

    if (associatedEmails) {
      associatedEmails = associatedEmails.concat(Array.from(emails));
    }

    else {
      associatedEmails = Array.from(emails);
    }

    const associatedEmailsSet = new Set<string>(associatedEmails);
    this.diagnostic.associatedEmails = Array.from(associatedEmailsSet);
  }

  ngOnInit() {
    this.dataService.getUser(localStorage.getItem('diagnosticUser')).subscribe(user => {
      this.firstName = user.firstName;
    });
  }
}
