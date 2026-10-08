import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NotaModel, VinculoNota } from '../../../models/nota.model';
import { NotaService, formatarTamanho, mensagemErroUpload } from '../../../services/nota.service';
import { ToastService } from '../../../services/toast.service';
import { SeletorNotas } from '../seletor-notas/seletor-notas';

/** Seção "Notas" do painel de detalhes: visualiza, anexa e remove notas. */
@Component({
  selector: 'app-notas',
  imports: [CommonModule, SeletorNotas],
  templateUrl: './notas.html',
  styleUrl: './notas.scss',
})
export class Notas implements OnChanges, OnDestroy {
  @Input({ required: true }) vinculo!: VinculoNota;
  /** Avisa a página para atualizar o contador de notas da linha. */
  @Output() totalAlterado = new EventEmitter<number>();

  notas: NotaModel[] = [];
  carregando = false;
  enviando = false;
  enviandoQtd = 0;

  selecionada: NotaModel | null = null;
  carregandoArquivo = false;
  formatarTamanho = formatarTamanho;

  /** Arquivos já baixados nesta abertura do painel (id da nota → object URL). */
  private arquivos = new Map<number, { url: string; seguro: SafeResourceUrl }>();

  constructor(
    private service: NotaService,
    private toast: ToastService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnChanges() {
    this.limparArquivos();
    this.notas = [];
    this.selecionada = null;
    this.carregar();
  }

  ngOnDestroy() {
    this.limparArquivos();
  }

  private carregar(selecionarId?: number) {
    this.carregando = true;
    this.service.listar(this.vinculo).subscribe({
      next: (notas) => {
        this.notas = notas;
        this.carregando = false;
        this.totalAlterado.emit(notas.length);
        const alvo = notas.find((n) => n.id === selecionarId) ?? notas[0] ?? null;
        if (alvo) this.selecionar(alvo);
        else this.selecionada = null;
      },
      error: () => {
        this.carregando = false;
        this.toast.erro('Erro ao carregar as notas.');
      },
    });
  }

  selecionar(nota: NotaModel) {
    this.selecionada = nota;
    if (this.arquivos.has(nota.id)) return;
    this.carregandoArquivo = true;
    this.service.baixar(nota.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.arquivos.set(nota.id, { url, seguro: this.sanitizer.bypassSecurityTrustResourceUrl(url) });
        this.carregandoArquivo = false;
      },
      error: () => {
        this.carregandoArquivo = false;
        this.toast.erro('Erro ao abrir a nota.');
      },
    });
  }

  arquivo(nota: NotaModel) {
    return this.arquivos.get(nota.id) ?? null;
  }

  tipo(nota: NotaModel): 'pdf' | 'imagem' | 'outro' {
    if (nota.mimeType === 'application/pdf') return 'pdf';
    if (nota.mimeType?.startsWith('image/')) return 'imagem';
    return 'outro';
  }

  abrirEmNovaAba(nota: NotaModel) {
    const a = this.arquivo(nota);
    if (a) window.open(a.url, '_blank');
  }

  enviar(arquivos: File[]) {
    this.enviando = true;
    this.enviandoQtd = arquivos.length;
    this.service.enviarTodos(arquivos, this.vinculo).subscribe({
      next: (respostas) => {
        this.enviando = false;
        const falha = respostas.find((r) => r?.error);
        if (falha) this.toast.erro(falha.message ?? 'Erro ao salvar a nota.');
        else this.toast.sucesso(arquivos.length > 1 ? 'Notas anexadas com sucesso!' : 'Nota anexada com sucesso!');
        const ultima = [...respostas].reverse().find((r) => r?.id);
        this.carregar(ultima?.id);
      },
      error: (err) => {
        this.enviando = false;
        this.toast.erro(mensagemErroUpload(err));
        this.carregar(this.selecionada?.id);
      },
    });
  }

  excluir(nota: NotaModel) {
    if (!confirm(`Deseja excluir a nota "${nota.nomeArquivo}"?`)) return;
    this.service.deletar(nota.id).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        const a = this.arquivos.get(nota.id);
        if (a) URL.revokeObjectURL(a.url);
        this.arquivos.delete(nota.id);
        this.carregar();
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }

  private limparArquivos() {
    this.arquivos.forEach((a) => URL.revokeObjectURL(a.url));
    this.arquivos.clear();
  }
}
