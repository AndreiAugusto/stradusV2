import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { OficinaModel } from '../../../models/oficina.model';
import { OficinaService } from '../../../services/oficina.service';
import { ToastService } from '../../../services/toast.service';
import { ManutencaoModel } from '../../../models/manutencao.model';
import { ManutencaoService } from '../../../services/manutencao.service';

@Component({
  selector: 'app-oficina',
  imports: [Menu, CommonModule, ReactiveFormsModule],
  templateUrl: './oficina.html',
  styleUrl: './oficina.scss',
})
export class Oficina {
  isLoading = true;
  erro = false;
  oficinas: OficinaModel[] = [];

  showForm = false;
  salvando = false;
  editandoId: number | null = null;

  form = new FormGroup({
    nomeOficina: new FormControl('', [Validators.required]),
  });

  constructor(
    private service: OficinaService,
    private manutencaoService: ManutencaoService,
    private toast: ToastService,
  ) {}

  /** Manutenções usadas no painel de detalhes — carregadas só na primeira abertura. */
  manutencoes: ManutencaoModel[] | null = null;
  carregandoHistorico = false;

  private carregarHistorico() {
    if (this.manutencoes || this.carregandoHistorico) return;
    this.carregandoHistorico = true;
    this.manutencaoService.listar().subscribe({
      next: (data) => {
        this.manutencoes = data;
        this.carregandoHistorico = false;
      },
      error: () => { this.carregandoHistorico = false; },
    });
  }

  resumo(oficinaId: number) {
    const lista = (this.manutencoes ?? [])
      .filter(m => m.oficinaId === oficinaId)
      .sort((a, b) => (a.data < b.data ? 1 : -1));
    return {
      total: lista.length,
      custo: lista.reduce((s, m) => s + Number(m.custo ?? 0), 0),
      ultimas: lista.slice(0, 5),
    };
  }

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.isLoading = true;
    this.service.listar().subscribe({
      next: (data) => {
        this.oficinas = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar esta oficina?')) return;
    this.service.deletar(id).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.oficinas = this.oficinas.filter(o => o.id !== id);
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }

  abrirNovo() {
    this.editandoId = null;
    this.form.reset({ nomeOficina: '' });
    this.showForm = true;
  }

  abrirEdicao(item: OficinaModel) {
    this.editandoId = item.id ?? null;
    this.form.reset({ nomeOficina: item.nomeOficina });
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

    const payload: OficinaModel = { nomeOficina: this.form.value.nomeOficina! };

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

  detalhe: OficinaModel | null = null;

  abrirDetalhe(item: OficinaModel) {
    this.detalhe = item;
    this.carregarHistorico();
  }

  fecharDetalhe() {
    this.detalhe = null;
  }

  editarDoDetalhe(item: OficinaModel) {
    this.detalhe = null;
    this.abrirEdicao(item);
  }
}
