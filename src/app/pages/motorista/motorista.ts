import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { MotoristaModel } from '../../../models/motorista.model';
import { MotoristaService } from '../../../services/motorista.service';
import { ToastService } from '../../../services/toast.service';
import { FreteModel } from '../../../models/frete.model';
import { FreteService } from '../../../services/frete.service';

@Component({
  selector: 'app-motorista',
  imports: [Menu, CommonModule, ReactiveFormsModule],
  templateUrl: './motorista.html',
  styleUrl: './motorista.scss',
})
export class Motorista {
  isLoading = true;
  erro = false;
  motoristas: MotoristaModel[] = [];

  showForm = false;
  salvando = false;
  editandoId: number | null = null;

  form = new FormGroup({
    nomeMotorista: new FormControl('', [Validators.required]),
    nascimento:    new FormControl('', [Validators.required]),
    nCarteira:     new FormControl(''),
  });

  constructor(
    private service: MotoristaService,
    private freteService: FreteService,
    private toast: ToastService,
  ) {}

  /** Fretes usados no painel de detalhes — carregados só na primeira abertura. */
  fretes: FreteModel[] | null = null;
  carregandoHistorico = false;

  private carregarHistorico() {
    if (this.fretes || this.carregandoHistorico) return;
    this.carregandoHistorico = true;
    this.freteService.listar().subscribe({
      next: (data) => {
        this.fretes = data;
        this.carregandoHistorico = false;
      },
      error: () => { this.carregandoHistorico = false; },
    });
  }

  fretesDoMotorista(motoristaId: number) {
    return (this.fretes ?? [])
      .filter(f => f.motoristaId === motoristaId)
      .sort((a, b) => (a.data < b.data ? 1 : -1));
  }

  comissao(f: FreteModel) {
    return Number(f.valor ?? 0) * Number(f.porcentagemMotorista ?? 0) / 100;
  }

  resumo(motoristaId: number) {
    const fretes = this.fretesDoMotorista(motoristaId);
    return {
      fretes: fretes.length,
      bruto: fretes.reduce((s, f) => s + Number(f.valor ?? 0), 0),
      comissao: fretes.reduce((s, f) => s + this.comissao(f), 0),
      ultimos: fretes.slice(0, 5),
    };
  }

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.isLoading = true;
    this.service.listar().subscribe({
      next: (data) => {
        this.motoristas = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar este motorista?')) return;
    this.service.deletar(id).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.motoristas = this.motoristas.filter(m => m.id !== id);
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }

  abrirNovo() {
    this.editandoId = null;
    this.form.reset({ nomeMotorista: '', nascimento: '', nCarteira: '' });
    this.showForm = true;
  }

  abrirEdicao(item: MotoristaModel) {
    this.editandoId = item.id ?? null;
    this.form.reset({
      nomeMotorista: item.nomeMotorista,
      nascimento: item.nascimento?.slice(0, 10),
      nCarteira: item.nCarteira ?? '',
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
    const payload: MotoristaModel = {
      nomeMotorista: valorForm.nomeMotorista!,
      nascimento: valorForm.nascimento!,
      nCarteira: valorForm.nCarteira || undefined,
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

  detalhe: MotoristaModel | null = null;

  abrirDetalhe(item: MotoristaModel) {
    this.detalhe = item;
    this.carregarHistorico();
  }

  fecharDetalhe() {
    this.detalhe = null;
  }

  editarDoDetalhe(item: MotoristaModel) {
    this.detalhe = null;
    this.abrirEdicao(item);
  }
}
