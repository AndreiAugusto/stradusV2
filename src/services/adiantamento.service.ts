import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AdiantamentoModel } from '../models/adiantamento.model';

@Injectable({ providedIn: 'root' })
export class AdiantamentoService {
  private url = `${environment.apiUrl}/adiantamento`;

  constructor(private http: HttpClient) {}

  /** Adiantamentos feitos no mês/ano ou com parcela descontada do salário dele. */
  listarDoMes(mes: number, ano: number) { return this.http.get<AdiantamentoModel[]>(this.url, { params: { mes, ano } }); }
  criar(data: AdiantamentoModel)        { return this.http.post(this.url, data); }
  atualizar(id: number, data: AdiantamentoModel) { return this.http.patch(`${this.url}/${id}`, data); }
  deletar(id: number)                   { return this.http.delete(`${this.url}/${id}`); }
}
