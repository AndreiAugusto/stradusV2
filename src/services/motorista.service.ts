import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { MotoristaModel } from '../models/motorista.model';

@Injectable({ providedIn: 'root' })
export class MotoristaService {
  private url = `${environment.apiUrl}/motorista`;

  constructor(private http: HttpClient) {}

  listar()                         { return this.http.get<MotoristaModel[]>(this.url); }
  buscar(id: number)               { return this.http.get<MotoristaModel>(`${this.url}/${id}`); }
  criar(data: MotoristaModel)      { return this.http.post<MotoristaModel>(this.url, data); }
  atualizar(id: number, data: MotoristaModel) { return this.http.patch<MotoristaModel>(`${this.url}/${id}`, data); }
  deletar(id: number)              { return this.http.delete(`${this.url}/${id}`); }
}
