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
    oficinaId:      new FormControl<number | null>(null, [Validators.required]),
    numeroParcelas: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
  });

  get totalGasto() { return this.manutencoes.reduce((s, m) => s + (m.custo ?? 0), 0); }

  constructor(
    private service: ManutencaoService,
    private caminhaoService: CaminhaoService,
    private oficinaService: OficinaService,
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
      next: () => { this.manutencoes = this.manutencoes.filter(m => m.id !== id); },
    });
  }

  abrirNovo() {
    this.editandoId = null;
    this.form.reset({ descricao: '', custo: null, data: '', caminhaoId: null, oficinaId: null, numeroParcelas: 1 });
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
      oficinaId: item.oficinaId ?? null,
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

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valorForm = this.form.value;
    const payload: ManutencaoModel = {
      descricao: valorForm.descricao!,
      caminhaoId: valorForm.caminhaoId!,
      oficinaId: valorForm.oficinaId!,
    } as ManutencaoModel;

    if (!this.editandoId) {
      // Custo, data e parcelas só são definidos na criação — ver abrirEdicao().
      payload.custo = Number(valorForm.custo);
      payload.data = valorForm.data!;
      payload.numeroParcelas = Number(valorForm.numeroParcelas) || 1;
    }

    this.salvando = true;
    const request = this.editandoId
      ? this.service.atualizar(this.editandoId, payload)
      : this.service.criar(payload);

    request.subscribe({
      next: () => {
        this.salvando = false;
        this.showForm = false;
        this.carregar();
      },
      error: () => {
        this.salvando = false;
      },
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
      next: () => {
        parcela.pago = novoStatus;
        const manutencao = this.manutencoes.find(m => m.id === manutencaoId);
        if (manutencao) {
          const pagas = this.parcelasPorManutencao[manutencaoId].filter(p => p.pago).length;
          manutencao.parcelasPagas = pagas;
        }
      },
    });
  }
}
