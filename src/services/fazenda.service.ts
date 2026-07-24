import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { FazendaModel } from '../models/fazenda.model';

@Injectable({ providedIn: 'root' })
export class FazendaService {
  private url = `${environment.apiUrl}/fazenda`;

  constructor(private http: HttpClient) {}

  listar()                        { return this.http.get<FazendaModel[]>(this.url); }
  buscar(id: number)              { return this.http.get<FazendaModel>(`${this.url}/${id}`); }
  criar(data: FazendaModel)       { return this.http.post<FazendaModel>(this.url, data); }
  atualizar(id: number, data: FazendaModel) { return this.http.patch<FazendaModel>(`${this.url}/${id}`, data); }
  deletar(id: number)             { return this.http.delete(`${this.url}/${id}`); }
}
