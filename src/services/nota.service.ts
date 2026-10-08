import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { from } from 'rxjs';
import { concatMap, switchMap, toArray } from 'rxjs/operators';
import { upload } from '@vercel/blob/client';
import { environment } from '../environments/environment';
import { NotaModel, VinculoNota } from '../models/nota.model';
import { comprimirImagem } from '../utils/imagem.util';

export const TAMANHO_MAXIMO_NOTA = 10 * 1024 * 1024;

@Injectable({ providedIn: 'root' })
export class NotaService {
  private url = `${environment.apiUrl}/nota`;

  constructor(private http: HttpClient) {}

  listar(vinculo: VinculoNota) {
    const params = new HttpParams({ fromObject: vinculo as Record<string, number> });
    return this.http.get<NotaModel[]>(this.url, { params });
  }

  /**
   * Envia o arquivo direto do navegador pro Vercel Blob (mesmo token de
   * upload do Escritório Virtual) e depois registra a nota no banco.
   */
  enviar(arquivo: File, vinculo: VinculoNota) {
    const token = localStorage.getItem('accessToken');
    const pasta = 'freteId' in vinculo ? `frete/${vinculo.freteId}` : `manutencao/${vinculo.manutencaoId}`;

    return from(comprimirImagem(arquivo)).pipe(
      switchMap((final) =>
        from(
          upload(`notas/${pasta}/${Date.now()}-${final.name}`, final, {
            access: 'private',
            handleUploadUrl: `${environment.apiUrl}/documento/upload-token`,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
        ).pipe(
          switchMap((blob) =>
            this.http.post<any>(`${this.url}/confirmar`, {
              ...vinculo,
              url: blob.url,
              nomeArquivo: final.name,
              mimeType: final.type || 'application/octet-stream',
              tamanho: final.size,
            }),
          ),
        ),
      ),
    );
  }

  /** Envia vários arquivos, um de cada vez. */
  enviarTodos(arquivos: File[], vinculo: VinculoNota) {
    return from(arquivos).pipe(concatMap((a) => this.enviar(a, vinculo)), toArray());
  }

  baixar(id: number)  { return this.http.get(`${this.url}/${id}/arquivo`, { responseType: 'blob' }); }
  deletar(id: number) { return this.http.delete<any>(`${this.url}/${id}`); }
}

export function mensagemErroUpload(err: any): string {
  // O @vercel/blob/client usa essa mensagem genérica para qualquer falha ao
  // pegar o token (sessão expirada, tipo/tamanho não permitido...).
  if (err instanceof Error && err.message === 'Failed to retrieve the client token') {
    return 'Não foi possível enviar a nota. Sua sessão pode ter expirado — entre novamente.';
  }
  if (err instanceof Error && err.message) return err.message;
  const apiMsg = err?.error?.message;
  if (typeof apiMsg === 'string') return apiMsg;
  if (err?.status === 0) return 'Sem conexão com o servidor. Verifique sua internet.';
  return 'Erro ao enviar a nota.';
}

export function formatarTamanho(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}
