import { Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { CaminhaoModel } from '../../../models/caminhao.model';
import { CaminhaoService } from '../../../services/caminhao.service';
import { ToastService } from '../../../services/toast.service';
import { FreteModel } from '../../../models/frete.model';
import { FreteService } from '../../../services/frete.service';
import { AbastecimentoModel } from '../../../models/abastecimento.model';
import { AbastecimentoService } from '../../../services/abastecimento.service';
import { ManutencaoModel } from '../../../models/manutencao.model';
import { ManutencaoService } from '../../../services/manutencao.service';

@Component({
  selector: 'app-caminhao',
  imports: [Menu, CommonModule, ReactiveFormsModule],
  templateUrl: './caminhao.html',
  styleUrl: './caminhao.scss',
})
export class Caminhao {
  isLoading = true;
  erro = false;
  caminhoes: CaminhaoModel[] = [];

  showForm = false;
  salvando = false;
  editandoId: number | null = null;

  form = new FormGroup({
    modelo: new FormControl('', [Validators.required]),
    ano:    new FormControl('', [Validators.required]),
    placa:  new FormControl('', [Validators.required]),
  });

  constructor(
    private service: CaminhaoService,
    private freteService: FreteService,
    private abastecimentoService: AbastecimentoService,
    private manutencaoService: ManutencaoService,
    private toast: ToastService,
  ) {}

  /** Histórico usado no painel de detalhes — carregado só na primeira abertura. */
  fretes: FreteModel[] | null = null;
  abastecimentos: AbastecimentoModel[] = [];
  manutencoes: ManutencaoModel[] = [];
  carregandoHistorico = false;

  private carregarHistorico() {
    if (this.fretes || this.carregandoHistorico) return;
    this.carregandoHistorico = true;
    forkJoin({
      fretes: this.freteService.listar(),
      abastecimentos: this.abastecimentoService.listar(),
      manutencoes: this.manutencaoService.listar(),
    }).subscribe({
      next: (r) => {
        this.fretes = r.fretes;
        this.abastecimentos = r.abastecimentos;
        this.manutencoes = r.manutencoes;
        this.carregandoHistorico = false;
      },
      error: () => { this.carregandoHistorico = false; },
    });
  }

  resumo(caminhaoId: number) {
    const fretes = (this.fretes ?? []).filter(f => f.caminhaoId === caminhaoId);
    const abast = this.abastecimentos.filter(a => a.caminhaoId === caminhaoId);
    const manut = this.manutencoes.filter(m => m.caminhaoId === caminhaoId);
    const ultimoKm = abast.reduce((max, a) => Math.max(max, a.quilometragem ?? 0), 0);
    return {
      fretes: fretes.length,
      receita: fretes.reduce((s, f) => s + Number(f.valor ?? 0), 0),
      abastecimentos: abast.length,
      litros: abast.reduce((s, a) => s + Number(a.litros ?? 0), 0),
      custoAbastecimento: abast.reduce((s, a) => s + Number(a.custoTotal ?? 0), 0),
      manutencoes: manut.length,
      custoManutencao: manut.reduce((s, m) => s + Number(m.custo ?? 0), 0),
      ultimoKm: ultimoKm || null,
    };
  }

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.isLoading = true;
    this.service.listar().subscribe({
      next: (data) => {
        this.caminhoes = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar este caminhão?')) return;
    this.service.deletar(id).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.caminhoes = this.caminhoes.filter(c => c.id !== id);
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }

  abrirNovo() {
    this.editandoId = null;
    this.form.reset({ modelo: '', ano: '', placa: '' });
    this.showForm = true;
  }

  abrirEdicao(item: CaminhaoModel) {
    this.editandoId = item.id ?? null;
    this.form.reset({
      modelo: item.modelo,
      ano: item.ano?.slice(0, 10),
      placa: item.placa,
    });
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
    const payload: CaminhaoModel = {
      modelo: valorForm.modelo!,
      ano: valorForm.ano!,
      placa: valorForm.placa!,
    };

    this.salvando = true;
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
  }

  detalhe: CaminhaoModel | null = null;

  abrirDetalhe(item: CaminhaoModel) {
    this.detalhe = item;
    this.carregarHistorico();
  }

  fecharDetalhe() {
    this.detalhe = null;
  }

  editarDoDetalhe(item: CaminhaoModel) {
    this.detalhe = null;
    this.abrirEdicao(item);
  }
}
