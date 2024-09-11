import { Component, OnInit, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { environment } from '../../environments/environment';
import { DataService } from '../_services/data.service';

import { Router } from '@angular/router';
import { User } from '../_models/http_resource';
import { JwtService } from '../_services/jwt.service';

const apiUrl = environment.apiUrl;
const loginEndpoint = environment.loginEndpoint;
const loginSAMLEndpoint = environment.loginSAMLEndpoint;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  rememberMe: boolean = false;
  loginForm: FormGroup;
  submitted = false;
  loginUrl;
  loginSAMLUrl;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private elementRef: ElementRef,
    private dataService: DataService,
    private jwt: JwtService) { }

  ngOnInit() {
    // this.authenticationService.logout();
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#263745';

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.loginUrl = apiUrl + '/' + loginEndpoint;
    this.loginSAMLUrl = apiUrl + '/' + loginSAMLEndpoint;

    window.onbeforeunload = () => this.ngOnDestroy();
  }

  ngOnDestroy() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'white';
  }

  get f() { return this.loginForm.controls; }

  processRememberMe() {
    this.rememberMe = !this.rememberMe;

    if (this.rememberMe) {
      //
    } else {
      //alert('forgotten');
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    const tempUser = new User();
    tempUser.email = this.f['email'].value;
    tempUser.password = this.f['password'].value;

    this.dataService.checkLogin(tempUser).subscribe((response: any) => {
      localStorage.setItem('jwt', response.token);
      const userId = String(this.jwt.decode(response.token).id);
      localStorage.setItem('diagnosticUser', userId);

      this.dataService.getUser(userId).subscribe(user => {
        // This is for updating the dictionary which holds previously logged in accounts.
        addCredentialsToLocalStorageDictionary(userId, response.token, user.email, user.firstName, user.lastName);
        this.router.navigateByUrl('/dashboard');
      });
    }, (err) => {
      alert('Login Failed');
    });
  }

  ssoSubmit() {
    this.dataService.redirectSSO().subscribe(s => {

    }, (err) => {
      alert('Login with SSO failed');
    });
  }
}

function addCredentialsToLocalStorageDictionary(id, jwt, email, firstName, lastName) {
  const dict = JSON.parse(localStorage.getItem('accountsDict')) || {};
  dict[email] = {
    'jwt': jwt,
    'id': id,
    'firstName': firstName,
    'lastName': lastName
  };

  localStorage.setItem('accountsDict', JSON.stringify(dict));
}

export default addCredentialsToLocalStorageDictionary;
