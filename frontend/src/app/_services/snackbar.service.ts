import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationMessageComponent } from '../_services/notification-message/notification-message.component';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) {}

  public openSnackBar(message: string, action: string = 'x', timeToFade = 3000) {
    this.snackBar.openFromComponent(NotificationMessageComponent, {
      duration: timeToFade,
      verticalPosition: 'top',
      data: { message: message, action: action }
    });
  }
}
