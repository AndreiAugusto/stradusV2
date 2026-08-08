import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { SelectBusca, OpcaoSelectBusca } from '../../components/select-busca/select-busca';
import { FreteModel } from '../../../models/frete.model';
import { FreteService } from '../../../services/frete.service';
import { CaminhaoModel } from '../../../models/caminhao.model';
import { CaminhaoService } from '../../../services/caminhao.service';
import { MotoristaModel } from '../../../models/motorista.model';
import { MotoristaService } from '../../../services/motorista.service';
import { CidadeService } from '../../../services/cidade.service';
import { CargaModel } from '../../../models/carga.model';
import { CargaService } from '../../../services/carga.service';
import { FazendaModel } from '../../../models/fazenda.model';
import { FazendaService } from '../../../services/fazenda.service';
import { ToastService } from '../../../services/toast.service';
import { intervaloMesAtual } from '../../../utils/periodo.util';

type ColunaFrete = 'data' | 'nomeFazenda' | 'placa' | 'nomeMotorista' | 'porcentagemMotorista' | 'valor';

@Component({
  selector: 'app-frete',
  imports: [Menu, CommonModule, ReactiveFormsModule, FormsModule, SelectBusca],
  templateUrl: './frete.html',
  styleUrl: './frete.scss',
})
export class Frete {
  isLoading = true;
  erro = false;
  fretes: FreteModel[] = [];

  caminhoes: CaminhaoModel[] = [];
  motoristas: MotoristaModel[] = [];
  cargas: CargaModel[] = [];
  /** Formato usado pelo <app-select-busca>; calculado explicitamente (não getter) por performance. */
  cidadesOpcoes: OpcaoSelectBusca[] = [];
  fazendas: FazendaModel[] = [];

  showForm = false;
  salvando = false;
  editandoId: number | null = null;

  filtro = {
    ...intervaloMesAtual(),
    caminhaoId: null as number | null,
    motoristaId: null as number | null,
    fazendaId: null as number | null,
  };

  sortColuna: ColunaFrete = 'data';
  sortAsc = false;

  form = new FormGroup({
    fazendaNome:           new FormControl(''),
    valor:                 new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    data:                  new FormControl('', [Validators.required]),
    caminhaoId:            new FormControl<number | null>(null, [Validators.required]),
    motoristaId:           new FormControl<number | null>(null, [Validators.required]),
    porcentagemMotorista:  new FormControl<number>(12, [Validators.required, Validators.min(0), Validators.max(100)]),
    origemId:              new FormControl<number | null>(null),
    destinoId:             new FormControl<number | null>(null),
    cargaId:               new FormControl<number | null>(null),
  });

  get totalMes()    { return this.fretesFiltrados.reduce((s, f) => s + f.valor, 0); }
  get quantidade()  { return this.fretesFiltrados.length; }
  get ticketMedio() { return this.quantidade ? this.totalMes / this.quantidade : 0; }

  get fretesFiltrados(): FreteModel[] {
    return this.fretes.filter((f) => {
      if (this.filtro.dataInicio && f.data.slice(0, 10) < this.filtro.dataInicio) return false;
      if (this.filtro.dataFim && f.data.slice(0, 10) > this.filtro.dataFim) return false;
      if (this.filtro.caminhaoId && f.caminhaoId !== this.filtro.caminhaoId) return false;
      if (this.filtro.motoristaId && f.motoristaId !== this.filtro.motoristaId) return false;
      if (this.filtro.fazendaId && f.fazendaId !== this.filtro.fazendaId) return false;
      return true;
    });
  }

  get fretesOrdenados(): FreteModel[] {
    const dir = this.sortAsc ? 1 : -1;
    return [...this.fretesFiltrados].sort((a, b) => {
      const va = a[this.sortColuna];
      const vb = b[this.sortColuna];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }

  ordenarPor(coluna: ColunaFrete) {
    if (this.sortColuna === coluna) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColuna = coluna;
      this.sortAsc = coluna === 'data' ? false : true;
    }
  }

  limparFiltros() {
    this.filtro = { dataInicio: '', dataFim: '', caminhaoId: null, motoristaId: null, fazendaId: null };
  }

  constructor(
    private service: FreteService,
    private caminhaoService: CaminhaoService,
    private motoristaService: MotoristaService,
    private cidadeService: CidadeService,
    private cargaService: CargaService,
    private fazendaService: FazendaService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.carregar();
    this.caminhaoService.listar().subscribe({ next: (data) => { this.caminhoes = data; } });
    this.motoristaService.listar().subscribe({ next: (data) => { this.motoristas = data; } });
    this.cidadeService.listar().subscribe({
      next: (data) => { this.cidadesOpcoes = data.map(c => ({ id: c.id, label: `${c.nome}/${c.siglaEstado}` })); },
    });
    this.cargaService.listar().subscribe({ next: (data) => { this.cargas = data; } });
    this.fazendaService.listar().subscribe({ next: (data) => { this.fazendas = data; } });
  }

  carregar() {
    this.isLoading = true;
    this.service.listar().subscribe({
      next: (data) => {
        this.fretes = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar este frete?')) return;
    this.service.deletar(id).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.fretes = this.fretes.filter(f => f.id !== id);
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }

  abrirNovo() {
    this.editandoId = null;
    this.form.reset({
      fazendaNome: '', valor: null, data: '', caminhaoId: null, motoristaId: null,
      porcentagemMotorista: 12, origemId: null, destinoId: null, cargaId: null,
    });
    this.showForm = true;
  }

  abrirEdicao(item: FreteModel) {
    this.editandoId = item.id ?? null;
    this.form.reset({
      fazendaNome: item.nomeFazenda ?? '',
      valor: item.valor,
      data: item.data?.slice(0, 10),
      caminhaoId: item.caminhaoId,
      motoristaId: item.motoristaId,
      porcentagemMotorista: item.porcentagemMotorista ?? 12,
      origemId: item.origem ?? null,
      destinoId: item.destino ?? null,
      cargaId: item.carga ?? null,
    });
    this.showForm = true;
  }

  fecharForm() {
    this.showForm = false;
  }

  detalhe: FreteModel | null = null;

  abrirDetalhe(frete: FreteModel) {
    this.detalhe = frete;
  }

  fecharDetalhe() {
    this.detalhe = null;
  }

  editarDoDetalhe(frete: FreteModel) {
    this.detalhe = null;
    this.abrirEdicao(frete);
  }

  /** Acha a fazenda digitada na lista já carregada (case/espaço-insensitive) ou cria uma nova, sem cidade/contato. */
  private resolverFazendaId(nomeDigitado: string, aoResolver: (fazendaId: number | undefined) => void) {
    const nome = nomeDigitado.trim();
    if (!nome) {
      aoResolver(undefined);
      return;
    }
    const existente = this.fazendas.find((f) => f.nome.trim().toLowerCase() === nome.toLowerCase());
    if (existente) {
      aoResolver(existente.id!);
      return;
    }
    this.fazendaService.criar({ nome }).subscribe({
      next: (res: any) => {
        if (res?.error || !res?.id) {
          this.toast.erro(res?.message ?? 'Erro ao criar fazenda.');
          this.salvando = false;
          return;
        }
        this.fazendas = [...this.fazendas, { id: res.id, nome }];
        aoResolver(res.id);
      },
      error: () => {
        this.toast.erro('Erro ao comunicar com o servidor.');
        this.salvando = false;
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;
    const valorForm = this.form.value;

    this.resolverFazendaId(valorForm.fazendaNome ?? '', (fazendaId) => {
      const payload: FreteModel = {
        valor: Number(valorForm.valor),
        data: valorForm.data!,
        caminhaoId: valorForm.caminhaoId!,
        motoristaId: valorForm.motoristaId!,
        porcentagemMotorista: Number(valorForm.porcentagemMotorista),
        origemId: valorForm.origemId ?? undefined,
        destinoId: valorForm.destinoId ?? undefined,
        cargaId: valorForm.cargaId ?? undefined,
        fazendaId,
      };

      const request = this.editandoId
        ? this.service.atualizar(this.editandoId, payload)
        : this.service.criar(payload);

      request.subscribe({
        next: (res) => {
          this.toast.deResposta(res);
          this.salvando = false;
          this.showForm = false;
          this.carregar();
        },
        error: () => {
          this.toast.erro('Erro ao comunicar com o servidor.');
          this.salvando = false;
        },
      });
    });
  }
}
