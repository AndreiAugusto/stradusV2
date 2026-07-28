import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { FazendaContatoModel, FazendaModel } from '../models/fazenda.model';

@Injectable({ providedIn: 'root' })
export class FazendaService {
  private url = `${environment.apiUrl}/fazenda`;

  constructor(private http: HttpClient) {}

  listar()                        { return this.http.get<FazendaModel[]>(this.url); }
  buscar(id: number)              { return this.http.get<FazendaModel>(`${this.url}/${id}`); }
  criar(data: FazendaModel)       { return this.http.post<FazendaModel>(this.url, data); }
  atualizar(id: number, data: FazendaModel) { return this.http.patch<FazendaModel>(`${this.url}/${id}`, data); }
  deletar(id: number)             { return this.http.delete(`${this.url}/${id}`); }

  listarContatos(fazendaId: number) { return this.http.get<FazendaContatoModel[]>(`${this.url}/${fazendaId}/contatos`); }
  adicionarContato(fazendaId: number, contato: string) { return this.http.post<any>(`${this.url}/${fazendaId}/contatos`, { contato }); }
  removerContato(contatoId: number) { return this.http.delete<any>(`${this.url}/contatos/${contatoId}`); }
}
