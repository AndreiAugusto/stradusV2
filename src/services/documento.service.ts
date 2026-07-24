import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { DocumentoModel } from '../models/documento.model';

@Injectable({ providedIn: 'root' })
export class DocumentoService {
  private url = `${environment.apiUrl}/documento`;

  constructor(private http: HttpClient) {}

  listar(filtro?: { tipo?: string; entidadeId?: number }) {
    let params = new HttpParams();
    if (filtro?.tipo) params = params.set('tipo', filtro.tipo);
    if (filtro?.entidadeId) params = params.set('entidadeId', filtro.entidadeId);
    return this.http.get<DocumentoModel[]>(this.url, { params });
  }

  enviar(formData: FormData) { return this.http.post<any>(this.url, formData); }
  deletar(id: number)        { return this.http.delete<any>(`${this.url}/${id}`); }
  baixarArquivo(id: number)  { return this.http.get(`${this.url}/${id}/arquivo`, { responseType: 'blob' }); }
}
