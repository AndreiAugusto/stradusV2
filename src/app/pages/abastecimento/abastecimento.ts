import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { AbastecimentoModel } from '../../../models/abastecimento.model';
import { AbastecimentoService } from '../../../services/abastecimento.service';
import { CaminhaoModel } from '../../../models/caminhao.model';
import { CaminhaoService } from '../../../services/caminhao.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-abastecimento',
  imports: [Menu, CommonModule, ReactiveFormsModule],
  templateUrl: './abastecimento.html',
  styleUrl: './abastecimento.scss',
})
export class Abastecimento {
  isLoading = true;
  erro = false;
  abastecimentos: AbastecimentoModel[] = [];
  caminhoes: CaminhaoModel[] = [];
  consumoPorId: Record<number, number | null> = {};

  showForm = false;
  salvando = false;
  editandoId: number | null = null;

  form = new FormGroup({
    caminhaoId:     new FormControl<number | null>(null, [Validators.required]),
    data:           new FormControl('', [Validators.required]),
    litros:         new FormControl<number | null>(null, [Validators.min(0.01)]),
    custoTotal:     new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    quilometragem:  new FormControl<number | null>(null, [Validators.min(0)]),
  });

  get totalGasto()  { return this.abastecimentos.reduce((s, a) => s + a.custoTotal, 0); }
  get totalLitros() { return this.abastecimentos.reduce((s, a) => s + (a.litros ?? 0), 0); }
  get precioMedio() {
    return this.totalLitros ? this.totalGasto / this.totalLitros : 0;
  }

  constructor(
    private service: AbastecimentoService,
    private caminhaoService: CaminhaoService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.carregar();
    this.caminhaoService.listar().subscribe({ next: (data) => { this.caminhoes = data; } });
  }

  carregar() {
    this.isLoading = true;
    this.service.listar().subscribe({
      next: (data) => {
        this.abastecimentos = data;
        this.calcularConsumos();
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  /** Consumo (km/L) comparando a quilometragem de cada abastecimento com a do anterior do mesmo caminhão. */
  private calcularConsumos() {
    const porCaminhao = new Map<number, AbastecimentoModel[]>();
    for (const a of this.abastecimentos) {
      if (a.quilometragem == null) continue;
      const lista = porCaminhao.get(a.caminhaoId) ?? [];
      lista.push(a);
      porCaminhao.set(a.caminhaoId, lista);
    }

    this.consumoPorId = {};
    for (const lista of porCaminhao.values()) {
      lista.sort((x, y) => x.quilometragem! - y.quilometragem!);
      for (let i = 1; i < lista.length; i++) {
        const atual = lista[i];
        const anterior = lista[i - 1];
        if (atual.litros && atual.quilometragem! > anterior.quilometragem!) {
          this.consumoPorId[atual.id!] = (atual.quilometragem! - anterior.quilometragem!) / atual.litros;
        }
      }
    }
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar este abastecimento?')) return;
    this.service.deletar(id).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.carregar();
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }

  abrirNovo() {
    this.editandoId = null;
    this.form.reset({ caminhaoId: null, data: '', litros: null, custoTotal: null, quilometragem: null });
    this.showForm = true;
  }

  abrirEdicao(item: AbastecimentoModel) {
    this.editandoId = item.id ?? null;
    this.form.reset({
      caminhaoId: item.caminhaoId,
      data: item.data?.slice(0, 10),
      litros: item.litros ?? null,
      custoTotal: item.custoTotal,
      quilometragem: item.quilometragem ?? null,
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
    const payload: AbastecimentoModel = {
      caminhaoId: valorForm.caminhaoId!,
      data: valorForm.data!,
      litros: valorForm.litros != null ? Number(valorForm.litros) : undefined,
      custoTotal: Number(valorForm.custoTotal),
      quilometragem: valorForm.quilometragem != null ? Number(valorForm.quilometragem) : undefined,
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
}
