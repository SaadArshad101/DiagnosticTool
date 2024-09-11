import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtService } from '../_services/jwt.service';
import { DataService } from '../_services/data.service';

@Component({
  selector: 'app-change-account',
  templateUrl: './change-account.component.html',
  styleUrls: ['./change-account.component.css']
})
export class ChangeAccountComponent implements OnInit {

  emails: string[] = [];
  accountsDict: object;
  currentEmail: string;
  removeMode = false;

  constructor(
    private router: Router,
    private jwtService: JwtService,
    private dataService: DataService
  ) { }

  // AccountsDict is an object where the key is the email and the value is an object that stores id in 'id' and jwt in 'jwt'
  ngOnInit() {
    this.accountsDict = JSON.parse(localStorage.getItem('accountsDict'));
    this.dataService.getUser(localStorage.getItem('diagnosticUser')).subscribe(user => {
      this.currentEmail = user.email;
    });

    for (const key of Object.keys(this.accountsDict)) {
      this.emails.push(key);
    }
  }

  //TODO verify if jwt token is still valid, this can be done by issuing a request with the token and seeing if its successful
  //Navigate to dashboard
  //Do not allow this on the account you are already on
  switchAccount(email: string) {
    const jwt = this.accountsDict[email]['jwt'];
    const id = this.accountsDict[email]['id'];
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('diagnosticUser', id);
    this.router.navigate(['/dashboard']);
  }

  getFirstName(email: string) {
    return this.accountsDict[email]['firstName'];
  }

  getLastName(email: string) {
    return this.accountsDict[email]['lastName'];
  }

  isCurrentlyLoggedIn(email: string) {
    if (email === this.currentEmail) {
      return true;
    }
    return false;
  }

  isTokenExpired(email: string) {
    const jwt = this.jwtService.decode(this.accountsDict[email]['jwt']);

    // expirateionDate is in seconds passed and currentDate is in milliseconds passed
    const expirationDate = jwt['exp'] * 1000;
    const currentDate = new Date().getTime();

    return expirationDate < currentDate;
  }

  removeAccountFromSession(email: string) {
    delete this.accountsDict[email];
    this.emails = this.emails.filter(e => e !== email);
    localStorage.setItem('accountsDict', JSON.stringify(this.accountsDict));
  }
}
