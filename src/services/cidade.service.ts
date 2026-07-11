import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CidadeModel } from '../models/cidade.model';

@Injectable({ providedIn: 'root' })
export class CidadeService {
  private url = `${environment.apiUrl}/cidade`;

  constructor(private http: HttpClient) {}

  listar()           { return this.http.get<CidadeModel[]>(this.url); }
  buscar(id: number) { return this.http.get<CidadeModel>(`${this.url}/${id}`); }
}
