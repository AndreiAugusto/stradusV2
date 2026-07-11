import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { ManutencaoModel, ManutencaoParcelaModel } from '../models/manutencao.model';

@Injectable({ providedIn: 'root' })
export class ManutencaoService {
  private url = `${environment.apiUrl}/manutencao`;

  constructor(private http: HttpClient) {}

  listar()                          { return this.http.get<ManutencaoModel[]>(this.url); }
  buscar(id: number)                { return this.http.get<ManutencaoModel>(`${this.url}/${id}`); }
  criar(data: ManutencaoModel)      { return this.http.post<ManutencaoModel>(this.url, data); }
  atualizar(id: number, data: ManutencaoModel) { return this.http.patch<ManutencaoModel>(`${this.url}/${id}`, data); }
  deletar(id: number)               { return this.http.delete(`${this.url}/${id}`); }

  listarParcelas(manutencaoId: number) { return this.http.get<ManutencaoParcelaModel[]>(`${this.url}/${manutencaoId}/parcelas`); }
  pagarParcela(parcelaId: number, pago: boolean) { return this.http.patch(`${this.url}/parcela/${parcelaId}`, { pago }); }
}
