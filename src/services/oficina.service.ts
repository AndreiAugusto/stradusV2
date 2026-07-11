import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { OficinaModel } from '../models/oficina.model';

@Injectable({ providedIn: 'root' })
export class OficinaService {
  private url = `${environment.apiUrl}/oficina`;

  constructor(private http: HttpClient) {}

  listar()                       { return this.http.get<OficinaModel[]>(this.url); }
  buscar(id: number)             { return this.http.get<OficinaModel>(`${this.url}/${id}`); }
  criar(data: OficinaModel)      { return this.http.post<OficinaModel>(this.url, data); }
  atualizar(id: number, data: OficinaModel) { return this.http.patch<OficinaModel>(`${this.url}/${id}`, data); }
  deletar(id: number)            { return this.http.delete(`${this.url}/${id}`); }
}
