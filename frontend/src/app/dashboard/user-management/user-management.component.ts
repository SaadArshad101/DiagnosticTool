import { Component, OnInit } from '@angular/core';
import { DataService } from '../../_services/data.service';
import { User } from 'src/app/_models/http_resource';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['../dashboard.component.css']
})
export class UserManagementComponent implements OnInit {

  constructor(private dataService: DataService,
              private router: Router) { }

  users: User[];
  // Maps diagnostic ids with diagnostic titles
  diagnosticMap: Map<string, string> = new Map<string, string>();

  math = Math;
  // These are paginator variables: https://ng-bootstrap.github.io/#/components/pagination/api
  currentPage = 1;
  pageSize = 25;
  maxSize = 10;
  filteredElements = [];
  searchText = '';

  ngOnInit() {
    this.filteredElements = this.getFilteredElements();
    this.dataService.getAllUsers().subscribe(users => {
      this.users = users;
    }, (err => {
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
    this.dataService.getAllDiagnostics().subscribe(diagnostics => {
      diagnostics.forEach(diagnostic => {
        this.diagnosticMap.set(diagnostic.id, diagnostic.title);
      });

      // Populate fields used for filtering
      this.users.forEach(user => {
        user.convertedRoleName = this.getConvertedRoleName(user.role);

        user.associatedDiagnosticNames = [];
        for (const id of user.diagnostics) {
          user.associatedDiagnosticNames.push(this.diagnosticMap.get(id));
        }
      });
    }, (err => {
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

  // returns an array of fields that we want to search over
  getFilteredElements(): string[] {
    const example = new User();

    return Object.getOwnPropertyNames(example).filter(field => {
      return ( field !== 'email' && field !== 'firstName' && field !== 'lastName'
            && field !== 'associatedDiagnosticNames' && field !== 'convertedRoleName');
    });
  }

  deleteUser(user) {
    if (confirm('Are you sure you want to delete this Diagnostic?')) {
      this.dataService.deleteUser(user.id).subscribe(s => {
        this.users = this.users.filter(aUser => aUser.id !== user.id);
      }, (err => {
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
  }

  calculateDaysSinceLastInteraction(user: User) {
    if (!user.lastInteraction) {
      return null;
    }

    const differenceInTime = Date.now() - user.lastInteraction;
    const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));

    return differenceInDays;
  }

  updateUser(user) {
    this.dataService.updateUser(user);

    // Change the converted role name for filter feature
    user.convertedRoleName = this.getConvertedRoleName(user.role);
  }

  // Add a field that reflects the user's role with the frontend terminology
  getConvertedRoleName(role: string): string {
    if (role === 'Admin') {
      return 'System Admin';
    } else if (role === 'Designer') {
      return 'Diagnostic Admin';
    } else if (role === 'Taker') {
      return 'User';
    }
  }
}
