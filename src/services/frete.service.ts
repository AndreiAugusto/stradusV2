import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { FreteModel } from '../models/frete.model';

@Injectable({ providedIn: 'root' })
export class FreteService {
  private url = `${environment.apiUrl}/frete`;

  constructor(private http: HttpClient) {}

  listar()                      { return this.http.get<FreteModel[]>(this.url); }
  buscar(id: number)            { return this.http.get<FreteModel>(`${this.url}/${id}`); }
  criar(data: FreteModel)       { return this.http.post<FreteModel>(this.url, data); }
  atualizar(id: number, data: FreteModel) { return this.http.patch<FreteModel>(`${this.url}/${id}`, data); }
  deletar(id: number)           { return this.http.delete(`${this.url}/${id}`); }
}
