import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TAMANHO_MAXIMO_NOTA, formatarTamanho } from '../../../services/nota.service';

/**
 * Botões "Tirar foto" (abre a câmera no celular) e "Anexar arquivo".
 * - Sempre emite `selecionados` com os arquivos válidos escolhidos.
 * - Se `arquivos` for passado, mostra a lista de pendentes (usado no modal,
 *   onde o envio só acontece depois de salvar o registro).
 */
@Component({
  selector: 'app-seletor-notas',
  imports: [CommonModule],
  templateUrl: './seletor-notas.html',
  styleUrl: './seletor-notas.scss',
})
export class SeletorNotas implements OnDestroy {
  @Input() arquivos: File[] | null = null;
  @Input() desabilitado = false;
  @Output() arquivosChange = new EventEmitter<File[]>();
  @Output() selecionados = new EventEmitter<File[]>();

  erro = '';
  formatarTamanho = formatarTamanho;
  private previews = new Map<File, string>();

  aoEscolher(event: Event, daCamera: boolean) {
    const input = event.target as HTMLInputElement;
    const escolhidos = Array.from(input.files ?? []);
    input.value = '';
    this.erro = '';

    const validos: File[] = [];
    for (const original of escolhidos) {
      if (!original.type.startsWith('image/') && original.type !== 'application/pdf') {
        this.erro = `"${original.name}" não é imagem nem PDF.`;
        continue;
      }
      // Fotos tiradas pelo celular vêm como "image.jpg" — dá um nome útil.
      const arquivo = daCamera
        ? new File([original], `foto-nota-${this.carimbo()}.jpg`, { type: original.type || 'image/jpeg' })
        : original;
      // Imagens grandes são reduzidas antes do envio; só o PDF tem limite rígido aqui.
      if (arquivo.type === 'application/pdf' && arquivo.size > TAMANHO_MAXIMO_NOTA) {
        this.erro = `"${arquivo.name}" é muito grande (máximo 10MB).`;
        continue;
      }
      validos.push(arquivo);
    }
    if (validos.length === 0) return;

    this.selecionados.emit(validos);
    if (this.arquivos) this.arquivosChange.emit([...this.arquivos, ...validos]);
  }

  remover(arquivo: File) {
    const url = this.previews.get(arquivo);
    if (url) URL.revokeObjectURL(url);
    this.previews.delete(arquivo);
    this.arquivosChange.emit((this.arquivos ?? []).filter((a) => a !== arquivo));
  }

  preview(arquivo: File): string | null {
    if (!arquivo.type.startsWith('image/')) return null;
    let url = this.previews.get(arquivo);
    if (!url) {
      url = URL.createObjectURL(arquivo);
      this.previews.set(arquivo, url);
    }
    return url;
  }

  ngOnDestroy() {
    this.previews.forEach((url) => URL.revokeObjectURL(url));
  }

  private carimbo() {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  }
}
