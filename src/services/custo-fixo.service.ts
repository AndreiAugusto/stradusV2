import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CustoFixoAjusteModel, CustoFixoModel } from '../models/custo-fixo.model';

@Injectable({ providedIn: 'root' })
export class CustoFixoService {
  private url = `${environment.apiUrl}/custo-fixo`;

  constructor(private http: HttpClient) {}

  listar()                          { return this.http.get<CustoFixoModel[]>(this.url); }
  buscar(id: number)                { return this.http.get<CustoFixoModel>(`${this.url}/${id}`); }
  criar(data: CustoFixoModel)       { return this.http.post<CustoFixoModel>(this.url, data); }
  atualizar(id: number, data: CustoFixoModel) { return this.http.patch<CustoFixoModel>(`${this.url}/${id}`, data); }
  deletar(id: number)               { return this.http.delete(`${this.url}/${id}`); }

  listarAjustes(custoFixoId: number) { return this.http.get<CustoFixoAjusteModel[]>(`${this.url}/${custoFixoId}/ajustes`); }
  salvarAjuste(custoFixoId: number, ajuste: { ano: number; mes: number; valor: number }) {
    return this.http.post(`${this.url}/${custoFixoId}/ajustes`, ajuste);
  }
  removerAjuste(ajusteId: number) { return this.http.delete(`${this.url}/ajustes/${ajusteId}`); }
}
