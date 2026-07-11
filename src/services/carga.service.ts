import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CargaModel } from '../models/carga.model';

@Injectable({ providedIn: 'root' })
export class CargaService {
  private url = `${environment.apiUrl}/carga`;

  constructor(private http: HttpClient) {}

  listar()           { return this.http.get<CargaModel[]>(this.url); }
  buscar(id: number) { return this.http.get<CargaModel>(`${this.url}/${id}`); }
}
