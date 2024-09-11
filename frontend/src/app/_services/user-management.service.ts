import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

const usersEndpoint = environment.apiUrl + '/' + environment.userEmailsAndNamesEndpoint;
const addToDiagnosticEndpoint = environment.apiUrl + '/' + environment.addDiagnosticToUserEndpoint;
const removeDiagnosticEndpoint = environment.apiUrl + '/' + environment.removeDiagnosticFromUserEndpoint;

// This service allows any role user to get each user's email and names for directory purposes
// It also allows you to add a diagnosticId to any user's diagnostics object, given that you have their email
// This was created because we wanted to allow limited manipulation/lookup of users for people without "admin" role
@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  constructor(
    private http: HttpClient
  ) { }

  getAllUserEmailsAndNames(): Observable<Object> {
    return this.http.get(usersEndpoint);
  }

  addDiagnosticToUser(email: string, diagnosticId: string): Observable<object> {
    const obj = {
      email: email,
      diagnosticId: diagnosticId
    };

    return this.http.post(addToDiagnosticEndpoint, obj);
  }

  removeDiagnosticFromUser(email: string, diagnosticId: string): Observable<object> {
    const obj = {
      email: email,
      diagnosticId: diagnosticId
    };

    return this.http.post(removeDiagnosticEndpoint , obj);
  }

}
