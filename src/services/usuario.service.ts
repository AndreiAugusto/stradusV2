import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AtualizarPerfilModel, PerfilModel } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private url = `${environment.apiUrl}/usuario`;

  constructor(private http: HttpClient) {}

  buscarPerfil()                          { return this.http.get<PerfilModel>(`${this.url}/me`); }
  atualizarPerfil(data: AtualizarPerfilModel) { return this.http.patch<{ message: string }>(`${this.url}/me`, data); }
}
