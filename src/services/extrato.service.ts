import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { ExtratoFiltro, ExtratoItem } from '../models/extrato.model';

@Injectable({ providedIn: 'root' })
export class ExtratoService {
  private url = `${environment.apiUrl}/dashboard/extrato`;

  constructor(private http: HttpClient) {}

  listar(filtro: ExtratoFiltro) {
    let params = new HttpParams();
    if (filtro.dataInicio) params = params.set('dataInicio', filtro.dataInicio);
    if (filtro.dataFim) params = params.set('dataFim', filtro.dataFim);
    if (filtro.tipos && filtro.tipos.length > 0) params = params.set('tipos', filtro.tipos.join(','));
    if (filtro.caminhaoId) params = params.set('caminhaoId', filtro.caminhaoId);
    if (filtro.motoristaId) params = params.set('motoristaId', filtro.motoristaId);

    return this.http.get<ExtratoItem[]>(this.url, { params });
  }
}
