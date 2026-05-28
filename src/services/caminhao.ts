import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Login } from '../models/login.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Caminhao {
  url = environment.apiUrl;

  constructor(
    protected http: HttpClient
  ) {}

  login(data: Login) {
    const url = `${this.url}/usuario/login`;

    return this.http.post(url, data).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
}
