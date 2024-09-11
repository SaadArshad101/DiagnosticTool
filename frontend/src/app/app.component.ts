import { Component, OnInit } from '@angular/core';
import { BnNgIdleService } from 'bn-ng-idle';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './_services/dialog/dialog.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private bnIdle: BnNgIdleService,
              private router: Router,
              private dialog: MatDialog) {
              }


  private hasTimedOut = false;

  ngOnInit() {
    this.bnIdle.startWatching(environment.logoutTimeout).subscribe((res) => {
      if (res && !this.hasTimedOut) {
        this.hasTimedOut = true;
        this.router.navigate(['logout']);
        this.openDialog();
      }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: 'You have been logged out due to inactivity'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.hasTimedOut = false;
    });
  }
}
