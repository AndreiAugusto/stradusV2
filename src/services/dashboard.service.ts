import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { ResumoDashboard } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private url = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  resumoMes()                      { return this.http.get<ResumoDashboard>(`${this.url}/resumo/mes`, {
    params: {
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear(),
    },
  }); }
  totalManutencoes()               { return this.http.get<{ count: number }>(`${this.url}/manutencao/count`); }
  totalOficinas()                  { return this.http.get<{ count: number }>(`${this.url}/oficina/count`); }
  totalCaminhoes()                 { return this.http.get<{ count: number }>(`${this.url}/caminhao/count`); }
  manutencoesPorCaminhao(id: number) { return this.http.get<{ count: number }>(`${this.url}/caminhao/countOne/${id}`); }
  manutencoesPorOficina(id: number)  { return this.http.get<{ count: number }>(`${this.url}/oficina/countOne/${id}`); }
  pagamentoMotorista(id: number)     { return this.http.get<any>(`${this.url}/motorista/pagamento/${id}`); }
}
