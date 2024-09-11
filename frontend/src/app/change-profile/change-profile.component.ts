import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../_services/data.service';

import { MustMatch } from '../_helpers/must-match.validator';
import { User } from '../_models/http_resource';
@Component({
  selector: 'app-change-profile',
  templateUrl: 'change-profile.component.html',
  styleUrls: ['change-profile.component.css']
})
export class ChangeProfileComponent implements OnInit {

  user;

  registerForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private elementRef: ElementRef,
    private dataService: DataService) { }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#263745';

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

    this.dataService.getUser(localStorage.getItem('diagnosticUser')).subscribe(user => {
      this.user = user;

      this.f.firstName.setValue(user.firstName);
      this.f.lastName.setValue(user.lastName);
      this.f.organization.setValue(user.organization);
      this.f.email.setValue(user.email);
      this.f.organizationRole.setValue(user.organizationRole);
      this.f.password.setValue(user.password);
      this.f.confirmPassword.setValue(user.password);
    });
  }

  ngOnDestroy() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'white';
  }

  // We can use this method in the template to get form values
  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.user.email = this.f['email'].value;
    // this.user.password = this.f['password'].value;
    this.user.organization = this.f['organization'].value;
    this.user.firstName = this.f['firstName'].value;
    this.user.lastName = this.f['lastName'].value;
    this.user.organizationRole = this.f['organizationRole'].value;
    this.user.password = this.f['password'].value;

    this.dataService.updateUser(this.user);
    this.router.navigateByUrl('/dashboard');
  }
}


