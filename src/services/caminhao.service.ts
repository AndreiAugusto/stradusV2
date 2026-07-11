import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CaminhaoModel } from '../models/caminhao.model';

@Injectable({ providedIn: 'root' })
export class CaminhaoService {
  private url = `${environment.apiUrl}/caminhao`;

  constructor(private http: HttpClient) {}

  listar()                        { return this.http.get<CaminhaoModel[]>(this.url); }
  buscar(id: number)              { return this.http.get<CaminhaoModel>(`${this.url}/${id}`); }
  criar(data: CaminhaoModel)      { return this.http.post<CaminhaoModel>(this.url, data); }
  atualizar(id: number, data: CaminhaoModel) { return this.http.patch<CaminhaoModel>(`${this.url}/${id}`, data); }
  deletar(id: number)             { return this.http.delete(`${this.url}/${id}`); }
}
