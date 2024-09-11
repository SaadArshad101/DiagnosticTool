import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const idToken = localStorage.getItem('jwt');

    if (idToken) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${idToken}`
        }
      });

      return next.handle(cloned);
    }

    return next.handle(req);
  }

}

