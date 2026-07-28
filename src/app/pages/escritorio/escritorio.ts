import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Menu } from '../../components/menu/menu';
import { DocumentoModel, TipoDocumento } from '../../../models/documento.model';
import { DocumentoService } from '../../../services/documento.service';
import { CaminhaoModel } from '../../../models/caminhao.model';
import { CaminhaoService } from '../../../services/caminhao.service';
import { MotoristaModel } from '../../../models/motorista.model';
import { MotoristaService } from '../../../services/motorista.service';
import { FazendaModel } from '../../../models/fazenda.model';
import { FazendaService } from '../../../services/fazenda.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-escritorio',
  imports: [Menu, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './escritorio.html',
  styleUrl: './escritorio.scss',
})
export class Escritorio {
  isLoading = true;
  erro = false;
  documentos: DocumentoModel[] = [];

  caminhoes: CaminhaoModel[] = [];
  motoristas: MotoristaModel[] = [];
  fazendas: FazendaModel[] = [];

  tipos: { valor: TipoDocumento; label: string; icone: string }[] = [
    { valor: 'empresa', label: 'Empresa', icone: 'bi-building' },
    { valor: 'caminhao', label: 'Caminhões', icone: 'bi-truck' },
    { valor: 'motorista', label: 'Motoristas', icone: 'bi-person-badge' },
    { valor: 'fazenda', label: 'Fazendas', icone: 'bi-tree' },
  ];

  tipoAtivo: TipoDocumento = 'empresa';
  entidadeFiltro: number | null = null;

  showForm = false;
  salvando = false;
  editandoId: number | null = null;
  arquivoSelecionado: File | null = null;
  arquivoErro = '';

  form = new FormGroup({
    titulo:      new FormControl('', [Validators.required]),
    categoria:   new FormControl(''),
    tipo:        new FormControl<TipoDocumento>('empresa', [Validators.required]),
    entidadeId:  new FormControl<number | null>(null),
  });

  /**
   * Listas calculadas explicitamente (não getters): usadas dentro de <select formControlName>,
   * um getter que devolve um array novo a cada ciclo de change detection trava o
   * SelectControlValueAccessor do Angular num loop (erro NG0103).
   */
  categoriasSugeridas: string[] = [];
  entidadesDoTipoForm: { id: number; label: string }[] = [];
  entidadesDoFiltro: { id: number; label: string }[] = [];

  constructor(
    private service: DocumentoService,
    private caminhaoService: CaminhaoService,
    private motoristaService: MotoristaService,
    private fazendaService: FazendaService,
    private toast: ToastService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.carregar();
    this.caminhaoService.listar().subscribe({ next: (data) => { this.caminhoes = data; this.atualizarListasDeEntidades(); } });
    this.motoristaService.listar().subscribe({ next: (data) => { this.motoristas = data; this.atualizarListasDeEntidades(); } });
    this.fazendaService.listar().subscribe({ next: (data) => { this.fazendas = data; this.atualizarListasDeEntidades(); } });

    // Lê o valor emitido pelo próprio evento, não `this.form.value.tipo`: o
    // Angular emite o valueChanges do controle filho ANTES de recalcular o
    // `.value` agregado do FormGroup pai, então reler `this.form.value` aqui
    // sempre pegava o tipo anterior (a lista ficava um passo atrasada).
    this.form.get('tipo')!.valueChanges.subscribe((tipo) => this.atualizarEntidadesDoTipoForm(tipo ?? 'empresa'));
  }

  private listaEntidades(tipo: TipoDocumento): { id: number; label: string }[] {
    if (tipo === 'caminhao') return this.caminhoes.map(c => ({ id: c.id!, label: `${c.placa} — ${c.modelo}` }));
    if (tipo === 'motorista') return this.motoristas.map(m => ({ id: m.id!, label: m.nomeMotorista }));
    if (tipo === 'fazenda') return this.fazendas.map(f => ({ id: f.id!, label: f.nome }));
    return [];
  }

  private atualizarListasDeEntidades() {
    this.entidadesDoFiltro = this.listaEntidades(this.tipoAtivo);
    this.atualizarEntidadesDoTipoForm(this.form.value.tipo ?? 'empresa');
  }

  private atualizarEntidadesDoTipoForm(tipo: TipoDocumento) {
    this.entidadesDoTipoForm = this.listaEntidades(tipo);
  }

  private atualizarCategoriasSugeridas() {
    const set = new Set(this.documentos.map(d => d.categoria).filter((c): c is string => !!c));
    this.categoriasSugeridas = [...set];
  }

  selecionarTipo(tipo: TipoDocumento) {
    this.tipoAtivo = tipo;
    this.entidadeFiltro = null;
    this.entidadesDoFiltro = this.listaEntidades(tipo);
    this.carregar();
  }

  carregar() {
    this.isLoading = true;
    this.service.listar({ tipo: this.tipoAtivo, entidadeId: this.entidadeFiltro ?? undefined }).subscribe({
      next: (data) => {
        this.documentos = data;
        this.atualizarCategoriasSugeridas();
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  abrirNovo() {
    this.editandoId = null;
    this.form.reset({ titulo: '', categoria: '', tipo: this.tipoAtivo, entidadeId: this.entidadeFiltro });
    this.atualizarEntidadesDoTipoForm(this.tipoAtivo);
    this.arquivoSelecionado = null;
    this.arquivoErro = '';
    this.showForm = true;
  }

  abrirEdicao(doc: DocumentoModel) {
    this.editandoId = doc.id ?? null;
    const entidadeId = doc.caminhaoId ?? doc.motoristaId ?? doc.fazendaId ?? null;
    this.form.reset({ titulo: doc.titulo, categoria: doc.categoria ?? '', tipo: doc.tipo, entidadeId });
    this.atualizarEntidadesDoTipoForm(doc.tipo);
    this.arquivoSelecionado = null;
    this.arquivoErro = '';
    this.showForm = true;
  }

  fecharForm() {
    this.showForm = false;
  }

  onArquivoSelecionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0] ?? null;
    this.arquivoErro = '';
    if (arquivo && arquivo.size > 10 * 1024 * 1024) {
      this.arquivoErro = 'Arquivo muito grande (máximo 10MB).';
      this.arquivoSelecionado = null;
      input.value = '';
      return;
    }
    this.arquivoSelecionado = arquivo;
  }

  onSubmit() {
    const precisaArquivo = !this.editandoId;
    if (this.form.invalid || (precisaArquivo && !this.arquivoSelecionado)) {
      this.form.markAllAsTouched();
      if (precisaArquivo && !this.arquivoSelecionado) this.arquivoErro = 'Selecione um arquivo.';
      return;
    }

    const valorForm = this.form.value;
    const meta = {
      titulo: valorForm.titulo!,
      categoria: valorForm.categoria || undefined,
      tipo: valorForm.tipo!,
      caminhaoId: valorForm.tipo === 'caminhao' ? valorForm.entidadeId ?? undefined : undefined,
      motoristaId: valorForm.tipo === 'motorista' ? valorForm.entidadeId ?? undefined : undefined,
      fazendaId: valorForm.tipo === 'fazenda' ? valorForm.entidadeId ?? undefined : undefined,
    };

    this.salvando = true;

    const request = this.editandoId
      ? this.service.atualizar(this.editandoId, meta)
      : this.service.enviarDireto(this.arquivoSelecionado!, meta);

    request.subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.salvando = false;
        this.showForm = false;
        if (valorForm.tipo === this.tipoAtivo) this.carregar();
      },
      error: (err) => {
        this.toast.erro(this.mensagemErroEnvio(err));
        this.salvando = false;
      },
    });
  }

  private mensagemErroEnvio(err: any): string {
    // erro do @vercel/blob/client ao buscar o token de upload — o SDK sempre usa
    // essa mesma mensagem genérica, seja porque a sessão expirou, o tipo/tamanho
    // do arquivo não é permitido, ou outro problema no /documento/upload-token
    if (err instanceof Error && err.message === 'Failed to retrieve the client token') {
      return 'Não foi possível iniciar o envio. Sua sessão pode ter expirado — tente fazer login novamente.';
    }
    if (err instanceof Error && err.message) {
      return err.message;
    }
    // erros HTTP da nossa API (endpoint de confirmação)
    const apiMsg = err?.error?.message;
    if (typeof apiMsg === 'string') return apiMsg;
    if (err?.status === 0) return 'Sem conexão com o servidor. Verifique sua internet.';
    return 'Erro ao comunicar com o servidor.';
  }

  abrindoId: number | null = null;

  visualizando: DocumentoModel | null = null;
  visualizandoTipo: 'pdf' | 'imagem' | 'outro' = 'outro';
  visualizandoObjectUrl: string | null = null;
  visualizandoSafeUrl: SafeResourceUrl | null = null;

  abrir(doc: DocumentoModel) {
    if (!doc.id) return;
    this.abrindoId = doc.id;
    this.service.baixarArquivo(doc.id).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.visualizandoObjectUrl = objectUrl;
        this.visualizandoSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        this.visualizandoTipo = this.tipoDoArquivo(doc.mimeType);
        this.visualizando = doc;
        this.abrindoId = null;
      },
      error: () => {
        this.toast.erro('Erro ao abrir o documento.');
        this.abrindoId = null;
      },
    });
  }

  fecharVisualizador() {
    if (this.visualizandoObjectUrl) URL.revokeObjectURL(this.visualizandoObjectUrl);
    this.visualizando = null;
    this.visualizandoObjectUrl = null;
    this.visualizandoSafeUrl = null;
  }

  private tipoDoArquivo(mimeType?: string): 'pdf' | 'imagem' | 'outro' {
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType?.startsWith('image/')) return 'imagem';
    return 'outro';
  }

  deletar(doc: DocumentoModel) {
    if (!doc.id || !confirm('Deseja excluir este documento?')) return;
    this.service.deletar(doc.id).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.documentos = this.documentos.filter(d => d.id !== doc.id);
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }

  nomeEntidade(doc: DocumentoModel): string {
    return doc.placaCaminhao || doc.nomeMotorista || doc.nomeFazenda || '—';
  }

  iconeArquivo(mimeType?: string): string {
    const tipo = this.tipoDoArquivo(mimeType);
    if (tipo === 'pdf') return 'bi-file-earmark-pdf';
    if (tipo === 'imagem') return 'bi-file-earmark-image';
    return 'bi-file-earmark';
  }

  formatarTamanho(bytes?: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
