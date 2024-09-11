import { Component, OnInit, ElementRef, OnDestroy, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../_services/data.service';
import { UserManagementService } from '../_services/user-management.service';

import { MustMatch } from '../_helpers/must-match.validator';
import { User } from '../_models/http_resource';
import { JwtService } from '../_services/jwt.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  @Input() multi: boolean;
  @Input() readOnly;
  @Input() registered;
  @Input() enableAssume;

  registerForm: FormGroup;
  submitted = false;
  accountsDict: object;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private elementRef: ElementRef,
    private dataService: DataService,
    private userMgmtService: UserManagementService,
    private jwt: JwtService) { }

  ngOnInit() {
    if (!this.multi && !this.readOnly) {
      this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#263745';
    }

    if (this.enableAssume) {
      this.accountsDict = JSON.parse(localStorage.getItem('accountsDict'));
    }

    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      // Todo: make a custom validator to check if the email has been registered already.
      organization: ['', Validators.required],
      organizationRole: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: [MustMatch('password', 'confirmPassword')]
    });
  }

  ngOnDestroy() {
    if (!this.multi && !this.readOnly) {
      this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'white';
    }
  }

  // We can use this method in the template to get form values
  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return null;
    }

    const user = new User();
    user.email = this.f['email'].value;
    user.password = this.f['password'].value;
    user.organization = this.f['organization'].value;
    user.firstName = this.f['firstName'].value;
    user.lastName = this.f['lastName'].value;
    user.organizationRole = this.f['organizationRole'].value;
    
    if (this.multi) {
      return this.dataService.addUser(user);
    }
    
    else {
      this.dataService.addUser(user).subscribe(s => {
        localStorage.setItem('diagnosticUser', s.id);
        this.login(user.email, user.password);
        this.router.navigateByUrl('/dashboard');
      }, (err => {
        if (err.status === 409) {
          alert('This email is being used by another account');
        } 
        else if (err.status === 403) {
          this.router.navigate(['not-authorized']);
        }
        //Add conditional logic for all other error response codes we directly handle
        else {
          console.log(err);
        }
      }));
    }

    return null;
  }

  login(email, password) {
    const tempUser = new User();
    tempUser.email = email;
    tempUser.password = password;

    this.dataService.checkLogin(tempUser).subscribe((response: any) => {
      localStorage.setItem('jwt', response.token);
      localStorage.setItem('diagnosticUser', String(this.jwt.decode(response.token).id));
      this.router.navigateByUrl('/dashboard');
    }, (err) => {
      alert('Login Failed');
    });
  }

  switchAccount(email: string) {
    if (this.enableAssume) {
      const jwt = this.accountsDict[email]['jwt'];
      const id = this.accountsDict[email]['id'];
      localStorage.setItem('jwt', jwt);
      localStorage.setItem('diagnosticUser', id);
      this.router.navigate(['/dashboard']);
    }
  }
}
