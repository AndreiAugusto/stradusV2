import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { upload } from '@vercel/blob/client';
import { environment } from '../environments/environment';
import { DocumentoModel, TipoDocumento } from '../models/documento.model';

export interface DocumentoMeta {
  titulo: string;
  categoria?: string;
  tipo: TipoDocumento;
  caminhaoId?: number | null;
  motoristaId?: number | null;
  fazendaId?: number | null;
}

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

  /**
   * Envia o arquivo direto do navegador pro Vercel Blob (sem passar pela
   * função serverless), depois confirma o registro no banco. Evita o limite
   * de ~4.5MB de payload das funções da Vercel, então funciona para
   * arquivos de até 10MB.
   */
  enviarDireto(arquivo: File, meta: DocumentoMeta) {
    const token = localStorage.getItem('accessToken');
    const pathname = `documentos/${meta.tipo}/${Date.now()}-${arquivo.name}`;

    return from(
      upload(pathname, arquivo, {
        access: 'private',
        handleUploadUrl: `${this.url}/upload-token`,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }),
    ).pipe(
      switchMap((blob) =>
        this.http.post<any>(`${this.url}/confirmar`, {
          ...meta,
          url: blob.url,
          nomeArquivo: arquivo.name,
          mimeType: arquivo.type || 'application/octet-stream',
          tamanho: arquivo.size,
        }),
      ),
    );
  }

  deletar(id: number)        { return this.http.delete<any>(`${this.url}/${id}`); }
  baixarArquivo(id: number)  { return this.http.get(`${this.url}/${id}/arquivo`, { responseType: 'blob' }); }
}
