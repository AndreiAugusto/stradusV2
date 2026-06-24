import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AbastecimentoModel } from '../models/abastecimento.model';

@Injectable({ providedIn: 'root' })
export class AbastecimentoService {
  private url = `${environment.apiUrl}/abastecimento`;

  constructor(private http: HttpClient) {}

  listar()                           { return this.http.get<AbastecimentoModel[]>(this.url); }
  buscar(id: number)                 { return this.http.get<AbastecimentoModel>(`${this.url}/${id}`); }
  criar(data: AbastecimentoModel)    { return this.http.post<AbastecimentoModel>(this.url, data); }
  atualizar(id: number, data: AbastecimentoModel) { return this.http.put<AbastecimentoModel>(`${this.url}/${id}`, data); }
  deletar(id: number)                { return this.http.delete(`${this.url}/${id}`); }
}
