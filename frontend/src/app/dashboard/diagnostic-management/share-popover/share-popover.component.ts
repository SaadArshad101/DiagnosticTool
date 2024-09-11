import { EventEmitter, Output, Component, Input } from "@angular/core";
import { UserDiagnosticData, User } from "../../../_models/http_resource";
import { DataService } from "../../../_services/data.service";
import { UserManagementService } from "../../../_services/user-management.service";
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-share-popover',
  templateUrl: './share-popover.component.html',
  styleUrls: ['./share-popover.component.css']
})
export class SharePopoverComponent {
  @Input() diagnostic;
  @Output() closeEmitter = new EventEmitter<boolean>();

  options: Object = [];
  filteredOptions: Observable<string[]>;
  formControl: FormControl = new FormControl();
  selectedEmails: Set<string> = new Set<string>();          // Emails selected from autocomplete for sharing
  userMap: Map<string, object> = new Map<string, object>(); // Maps emails to full set of user data
  
  constructor(
    public dataService: DataService,
    private userMgmtService: UserManagementService
  ) { }
  
  ngOnInit() {
    this.userMgmtService.getAllUserEmailsAndNames().subscribe(s => {
      this.options = s;

      this.listOptions().forEach(obj => {
        this.userMap.set(obj.email, obj);
      });

      this.filteredOptions = this.formControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this.filterResults(value))
        )
    })
  }

  filterResults(value: string): string[] {
    if (value.trim()) {
      return this.listOptions().filter(option => this.toLabel(option).toLowerCase().includes(value.toLowerCase()));
    }

    return [];
  }

  toLabel(option): string {
    return option.firstName + " " + option.lastName + " <" + option.email + ">";
  }

  cancel(): void {
    this.closeEmitter.emit();
  }

  share(): void {
    const ums = this.userMgmtService, diagnosticId = this.diagnostic.id;

    this.listSelectedEmails().forEach(function(email) {
      ums.addDiagnosticToUser(email, diagnosticId).subscribe(s => {
        console.log(s);
      }, err => {
        console.error(err);
      });
    });
    
    this.addUsersToDiagnostic();
    this.selectedEmails = new Set<string>(); // Reset selected users
    this.cancel(); // Close the popover
  }

  selectUser(event: MatAutocompleteSelectedEvent) {
    this.selectedEmails.add(event.option.value);
    this.formControl.setValue("");
  }

  removeEmail(email: string): void {
    this.selectedEmails.delete(email);
  }

  addUsersToDiagnostic(): void {
    this.listSelectedEmails().forEach(email => {
      this.dataService.createUserEntry(this.userMap.get(email)['id'], this.diagnostic);
    });

    this.dataService.updateDiagnostic(this.diagnostic);
  }

  emailToUserData(email: string, udd: UserDiagnosticData = new UserDiagnosticData()): UserDiagnosticData {
    udd.userId = this.userMap.get(email)["id"];

    return udd;
  }

  // Return selected emails as an array
  listSelectedEmails() {
    return Array.from(this.selectedEmails);
  }

  // Return options as an array
  listOptions() {
    return Object.values(this.options);
  }
}
