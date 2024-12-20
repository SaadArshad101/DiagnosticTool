import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private jwtHelperService: JwtHelperService) {}

  canActivate() {
    if (!this.jwtHelperService.isTokenExpired(localStorage.getItem('jwt'))) {
      return true;
    }

    this.router.navigate(['/logout']);
    return false;
  }

}
