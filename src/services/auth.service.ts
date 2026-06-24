import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Login } from '../models/login.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(data: Login) {
    return this.http.post<{ accessToken: string }>(`${this.url}/usuario/login`, data);
  }
}
