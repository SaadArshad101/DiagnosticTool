import { DataService } from '../../_services/data.service';
import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Diagnostic, User, DefaultDiagnostic } from '../../_models/http_resource';
import { DiagnosticService } from '../../_services/resource.service';
import { from } from 'rxjs';
import { concatMap, scan, last, filter } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { MatDialog } from '@angular/material/dialog';
import { TemplateBankComponent } from '../template-bank/template-bank.component';
import { ImportModalComponent } from '../import-modal/import-modal.component';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-diagnostic-management',
  templateUrl: './diagnostic-management.component.html',
  styleUrls: ['../dashboard.component.css']
})
export class DiagnosticManagementComponent implements OnInit {
  importStatus = '';
  diagnostics: Diagnostic[] = null;
  defaultDiagnosticIds: string[] = [];
  user: User;
  currentUser = '';
  currentTab = 'Diagnostics';
  userMap: Map<string, string> = new Map<string, string>();

  isAdmin = false;
  isTaker = false;
  isDesigner = false;

  screenHeight;
  screenWidth;

  math = Math;
  // These are paginator variables: https://ng-bootstrap.github.io/#/components/pagination/api
  currentPage = 1;
  pageSize = 25;
  maxSize = 10;
  filteredElements = [];
  searchText = '';

  sharePopover: NgbPopover;

  constructor(
    private dataService: DataService,
    private diagnosticService: DiagnosticService,
    private router: Router,
    private dialog: MatDialog,
) {}

  // returns an array of fields that we want to search over
  getFilteredElements(): string[] {
    const example = new Diagnostic();

    return Object.getOwnPropertyNames(example).filter(field => {
      return ( field !== 'title' && field !== 'associatedEmails' && field !== 'text' );
    });
  }

  // For Dialog size
  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  openTemplateBankDialog(): void {
    const dialogRef = this.dialog.open(TemplateBankComponent, {
      width: this.screenWidth,
      data: this.user
    });

    dialogRef.afterClosed().subscribe(response => {
      // Update diagnostics after close to check for new diagnostics
      this.dataService.getUser(this.currentUser).subscribe(user => {
        this.populateDiagnostics();
      });
    });
  }

  openImportDialog(): void {
    const dialogRef = this.dialog.open(ImportModalComponent, {
      width: '25%',
      data: this.user
    });

    dialogRef.afterClosed().subscribe(response => {
      // Update diagnostics after close to check for new diagnostics
      this.dataService.getUser(this.currentUser).subscribe(user => {
        this.populateDiagnostics();
      });
    });
  }

  initPopover(popover: NgbPopover): void {
    this.closePopover();
    this.sharePopover = popover;
  }
  
  closePopover(): void {
    if (this.sharePopover) {
      this.sharePopover.close();
    }
  }
  
  ngOnInit() {
    // Initialize the value of screenWidth and screenHeight
    this.onResize();
    this.filteredElements = this.getFilteredElements();

    try {
      this.currentUser = localStorage.getItem('diagnosticUser');

      this.dataService.getUser(this.currentUser).subscribe(user => {
        // This is to make sure the value stays constant and doesn't change when you're an admin
        this.user = JSON.parse(JSON.stringify(user));

        this.removeNonExistentDiagnostics();

        if (this.user.role === 'Admin') {
          this.isAdmin = true;
          this.dataService.getAllUsers().subscribe(users => {
            users.forEach(user2 => {
              this.userMap.set(user2.id, user2.email);
            });
          }, (err => {
            if (err.status === 404) {
              alert('This resource was not found');
            } else if (err.status === 403) {
              this.router.navigate(['not-authorized']);
            } else {
              return err.status;
            }
          }));
        } else if (this.user.role === 'Designer') {
          this.isDesigner = true;
        } else if (this.user.role === 'Taker') {
          this.isTaker = true;
        }

        this.dataService.getAllDefaultDiagnostics().subscribe(defaultDiagnostics => {
          for (const defaultDiagnostic of defaultDiagnostics) {
            this.defaultDiagnosticIds.push(defaultDiagnostic.diagnosticId);
          }

          this.populateDiagnostics();
        });
      });
    } catch (e) {
      console.log(e);
      this.router.navigate(['not-authenticated']);
    }
  }

  // Return list of diagnostics Ids composed of user.diagnostics and defaultDiagnostics
  getListOfAllDiagnosticIds(): string[] {
    // Create a deep copy of user.diagnostics
    let copy = JSON.parse(JSON.stringify(this.user.diagnostics));

    // Remove any intersection from copy with the default diagnostics.
    copy = copy.filter(x => !this.defaultDiagnosticIds.includes(x));

    // Merge copy with default diagnosticIds
    copy = this.defaultDiagnosticIds.concat(copy);

    return copy;
  }

  // Populate diagnostic.associatedEmails with all the users' emails associated with that diagnostic. Do this for each diagnostic
  mapOwnersAndTakersToEmails() {
    for (const diagnostic of this.diagnostics) {
      diagnostic.associatedEmails = [];

      for (const owner of diagnostic.owners) {
        diagnostic.associatedEmails.push(this.userMap.get(owner));
      }

      if (diagnostic.userData) {
        for (const data of diagnostic.userData) {
          diagnostic.associatedEmails.push(this.userMap.get(data.userId));
        }
      }
    }
  }

  populateDiagnostics() {
    if (this.isAdmin) {
      this.dataService.getAllDiagnostics().subscribe(list => {
        this.diagnostics = list;
        this.mapOwnersAndTakersToEmails();
      });
    } else {
      const diagnosticIdsToGet = this.getListOfAllDiagnosticIds();

      if (diagnosticIdsToGet.length > 0) {
        from(diagnosticIdsToGet).pipe(
          concatMap(id => this.diagnosticService.read(id)),
          scan<any>((allResponses, currentResponse) =>
            [...allResponses, JSON.parse(JSON.stringify((currentResponse)))], []),
          last())
          .subscribe(res2 => {
            this.diagnostics = res2;
            this.diagnostics = this.diagnostics.filter(diag => diag != null);
          });
      } else {
        this.diagnostics = [];
      }
    }
  }

  removeNonExistentDiagnostics() {
    if (this.user.diagnostics.length > 0) {
      from(this.user.diagnostics).pipe(
        concatMap(id => this.diagnosticService.read(id)),
        scan<any>((allResponses, currentResponse) =>
          [...allResponses, JSON.parse(JSON.stringify((currentResponse)))], []),
        last())
        .subscribe(res2 => {
          for (let i = res2.length - 1; i >= 0; i--) {
            if (res2[i] === null) {
              this.user.diagnostics.splice(i, 1);
            }
          }

          this.dataService.updateUser(this.user);
        });
    }
  }

  addDiagnosticToTemplateBank(diagnostic) {
    this.dataService.addTemplate(this.dataService.convertDiagnosticToTemplate(diagnostic))
        .subscribe(s => {}, (err => {
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

  addDiagnostic() {
    this.dataService.addDiagnostic(this.user).subscribe(diagnostic => {
      if (this.isAdmin) {
        diagnostic.associatedEmails = [];
        diagnostic.associatedEmails.push(this.user.email);
      }

      this.diagnostics.push(JSON.parse(JSON.stringify(diagnostic)));
      this.user.diagnostics.push(diagnostic.id);
      this.dataService.updateUser(this.user);
    }, (err => {
      if (err.status === 404) {
        alert('This resource was not found');
      }
      else if(err.status === 403) {
        this.router.navigate(['not-authorized']);
      }
      // Add conditional logic for all other error response codes we directly handle
      else {
        console.log(err);
      }
    }));
  }

  //Removes Diagnostic at the specified index
  removeDiagnostic(diagnostic) {
    if (confirm('Deleting will remove all data associated with the diagnostic. Are you sure you want to permanently delete this diagnostic?')) {
      try {
        this.dataService.deleteDiagnostic(diagnostic.id);

        this.user.diagnostics = this.user.diagnostics.filter(id => id !== diagnostic.id);
        this.diagnostics = this.diagnostics.filter(diag => diag.id !== diagnostic.id);

        this.dataService.updateUser(this.user);
      } catch (e) {
        alert("Something went wrong");
        console.log(e);
      }
    }
  }

  removeFromDashboard(diagnostic) {
    if (confirm('Are you sure you want to remove this diagnostic from your dashboard?')) {
      try {
        this.user.diagnostics = this.user.diagnostics.filter(id => id !== diagnostic.id);
        this.diagnostics = this.diagnostics.filter(diag => diag.id !== diagnostic.id);

        this.dataService.updateUser(this.user);
      } catch (e) {
        alert("Something went wrong");
        console.log(e);
      }
    }
  }

  exportDiagnostic(diagnostic) {
    const file = new Blob([JSON.stringify(this.removeIdField(this.filterDiagnosticData(diagnostic)))], {type : 'application/json'});
    saveAs(file, diagnostic.title + '.json');
  }

  filterDiagnosticData(diagnostic: Diagnostic) {
    const notAllowed = ['userData', 'owners', 'lock'];

    const filtered =  Object.keys(diagnostic)
    .filter(key => !notAllowed.includes(key))
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: diagnostic[key]
      };
    }, {});

    return filtered;
  }

  removeIdField(obj) {
    if (obj === null || typeof obj !== 'object') {
      return;
    }

    for (const key of Object.keys(obj)) {
      this.removeIdField(obj[key]);
    }

    obj['_id'] = null;

    return obj;
  }

  handleDefaultDiagnosticCheckbox(diagnostic) {
    if (this.defaultDiagnosticIds.includes(diagnostic.id)) {
      this.deleteDefaultDiagnostic(diagnostic);
    } else {
      this.addDefaultDiagnostic(diagnostic);
    }
  }

  addDefaultDiagnostic(diagnostic) {
    const defaultD = new DefaultDiagnostic();
    defaultD.diagnosticId = diagnostic.id;
    this.dataService.addDefaultDiagnostic(defaultD).subscribe(s => {
      this.defaultDiagnosticIds.push(diagnostic.id);
    });
  }

  deleteDefaultDiagnostic(diagnostic) {
    const defaultDiagnosticIndex = this.defaultDiagnosticIds.findIndex(id => id === diagnostic.id);
    this.dataService.removeDefaultDiagnostic(diagnostic.id).subscribe(s => {
      this.defaultDiagnosticIds.splice(defaultDiagnosticIndex, 1);
    });
  }
}
