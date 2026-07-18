import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  tipo: 'sucesso' | 'erro';
  mensagem: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private proximoId = 1;
  readonly toasts = signal<Toast[]>([]);

  sucesso(mensagem: string) {
    this.adicionar('sucesso', mensagem);
  }

  erro(mensagem: string) {
    this.adicionar('erro', mensagem);
  }

  /**
   * Os services do backend não lançam exceptions HTTP em erro de
   * validação/negócio — capturam no try/catch e devolvem {message, error}
   * com status 200. Por isso decide sucesso/erro pelo campo `error` da
   * resposta, não pelo callback `error` do HttpClient.
   */
  deResposta(res: any) {
    if (res && res.error) {
      this.erro(res.message ?? 'Ocorreu um erro.');
    } else {
      this.sucesso(res?.message ?? 'Operação realizada com sucesso.');
    }
  }

  remover(id: number) {
    this.toasts.update((lista) => lista.filter((t) => t.id !== id));
  }

  private adicionar(tipo: Toast['tipo'], mensagem: string) {
    const id = this.proximoId++;
    this.toasts.update((lista) => [...lista, { id, tipo, mensagem }]);
    setTimeout(() => this.remover(id), 4000);
  }
}
