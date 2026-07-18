import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { ManutencaoModel, ManutencaoParcelaModel } from '../../../models/manutencao.model';
import { ManutencaoService } from '../../../services/manutencao.service';
import { CaminhaoModel } from '../../../models/caminhao.model';
import { CaminhaoService } from '../../../services/caminhao.service';
import { OficinaModel } from '../../../models/oficina.model';
import { OficinaService } from '../../../services/oficina.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-manutencao',
  imports: [Menu, CommonModule, ReactiveFormsModule],
  templateUrl: './manutencao.html',
  styleUrl: './manutencao.scss',
})
export class Manutencao {
  isLoading = true;
  erro = false;
  manutencoes: ManutencaoModel[] = [];
  caminhoes: CaminhaoModel[] = [];
  oficinas: OficinaModel[] = [];

  showForm = false;
  salvando = false;
  editandoId: number | null = null;

  expandidoId: number | null = null;
  parcelasPorManutencao: Record<number, ManutencaoParcelaModel[]> = {};
  carregandoParcelas = false;

  form = new FormGroup({
    descricao:      new FormControl('', [Validators.required]),
    custo:          new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    data:           new FormControl('', [Validators.required]),
    caminhaoId:     new FormControl<number | null>(null, [Validators.required]),
    oficinaNome:    new FormControl('', [Validators.required]),
    numeroParcelas: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
  });

  get totalGasto() { return this.manutencoes.reduce((s, m) => s + (m.custo ?? 0), 0); }

  constructor(
    private service: ManutencaoService,
    private caminhaoService: CaminhaoService,
    private oficinaService: OficinaService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.carregar();
    this.caminhaoService.listar().subscribe({ next: (data) => { this.caminhoes = data; } });
    this.oficinaService.listar().subscribe({ next: (data) => { this.oficinas = data; } });
  }

  carregar() {
    this.isLoading = true;
    this.service.listar().subscribe({
      next: (data) => {
        this.manutencoes = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar esta manutenção?')) return;
    this.service.deletar(id).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.manutencoes = this.manutencoes.filter(m => m.id !== id);
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }

  abrirNovo() {
    this.editandoId = null;
    this.form.reset({ descricao: '', custo: null, data: '', caminhaoId: null, oficinaNome: '', numeroParcelas: 1 });
    this.form.get('custo')?.enable();
    this.form.get('data')?.enable();
    this.form.get('numeroParcelas')?.enable();
    this.showForm = true;
  }

  abrirEdicao(item: ManutencaoModel) {
    this.editandoId = item.id ?? null;
    this.form.reset({
      descricao: item.descricao ?? '',
      custo: item.custo ?? null,
      data: item.data?.slice(0, 10),
      caminhaoId: item.caminhaoId ?? null,
      oficinaNome: item.nomeOficina ?? '',
      numeroParcelas: item.numeroParcelas ?? 1,
    });
    // Custo, data e parcelas já geraram as parcelas no banco — trocar aqui
    // desincronizaria os valores/vencimentos já criados. Só descrição,
    // caminhão e oficina são editáveis após a criação.
    this.form.get('custo')?.disable();
    this.form.get('data')?.disable();
    this.form.get('numeroParcelas')?.disable();
    this.showForm = true;
  }

  fecharForm() {
    this.showForm = false;
  }

  /** Acha a oficina digitada na lista já carregada (case/espaço-insensitive) ou cria uma nova. */
  private resolverOficinaId(nomeDigitado: string, aoResolver: (oficinaId: number) => void) {
    const nome = nomeDigitado.trim();
    const existente = this.oficinas.find((o) => o.nomeOficina.trim().toLowerCase() === nome.toLowerCase());
    if (existente) {
      aoResolver(existente.id!);
      return;
    }
    this.oficinaService.criar({ nomeOficina: nome }).subscribe({
      next: (res: any) => {
        if (res?.error || !res?.id) {
          this.toast.erro(res?.message ?? 'Erro ao criar oficina.');
          this.salvando = false;
          return;
        }
        this.oficinas = [...this.oficinas, { id: res.id, nomeOficina: nome }];
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

    this.resolverOficinaId(valorForm.oficinaNome!, (oficinaId) => {
      const payload: ManutencaoModel = {
        descricao: valorForm.descricao!,
        caminhaoId: valorForm.caminhaoId!,
        oficinaId,
      } as ManutencaoModel;

      if (!this.editandoId) {
        // Custo, data e parcelas só são definidos na criação — ver abrirEdicao().
        payload.custo = Number(valorForm.custo);
        payload.data = valorForm.data!;
        payload.numeroParcelas = Number(valorForm.numeroParcelas) || 1;
      }

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

  toggleParcelas(m: ManutencaoModel) {
    if (!m.id) return;
    if (this.expandidoId === m.id) {
      this.expandidoId = null;
      return;
    }
    this.expandidoId = m.id;
    if (!this.parcelasPorManutencao[m.id]) {
      this.carregandoParcelas = true;
      this.service.listarParcelas(m.id).subscribe({
        next: (parcelas) => {
          this.parcelasPorManutencao[m.id!] = parcelas;
          this.carregandoParcelas = false;
        },
        error: () => { this.carregandoParcelas = false; },
      });
    }
  }

  togglePago(parcela: ManutencaoParcelaModel, manutencaoId: number) {
    const novoStatus = !parcela.pago;
    this.service.pagarParcela(parcela.id, novoStatus).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        parcela.pago = novoStatus;
        const manutencao = this.manutencoes.find(m => m.id === manutencaoId);
        if (manutencao) {
          const pagas = this.parcelasPorManutencao[manutencaoId].filter(p => p.pago).length;
          manutencao.parcelasPagas = pagas;
        }
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }
}
