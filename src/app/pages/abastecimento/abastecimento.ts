import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { AbastecimentoModel } from '../../../models/abastecimento.model';
import { AbastecimentoService } from '../../../services/abastecimento.service';
import { CaminhaoModel } from '../../../models/caminhao.model';
import { CaminhaoService } from '../../../services/caminhao.service';

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

  showForm = false;
  salvando = false;
  editandoId: number | null = null;

  form = new FormGroup({
    caminhaoId: new FormControl<number | null>(null, [Validators.required]),
    data:       new FormControl('', [Validators.required]),
    litros:     new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    custoTotal: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
  });

  get totalGasto()  { return this.abastecimentos.reduce((s, a) => s + a.custoTotal, 0); }
  get totalLitros() { return this.abastecimentos.reduce((s, a) => s + a.litros, 0); }
  get precioMedio() {
    return this.totalLitros ? this.totalGasto / this.totalLitros : 0;
  }

  constructor(private service: AbastecimentoService, private caminhaoService: CaminhaoService) {}

  ngOnInit() {
    this.carregar();
    this.caminhaoService.listar().subscribe({ next: (data) => { this.caminhoes = data; } });
  }

  carregar() {
    this.isLoading = true;
    this.service.listar().subscribe({
      next: (data) => {
        this.abastecimentos = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar este abastecimento?')) return;
    this.service.deletar(id).subscribe({
      next: () => { this.abastecimentos = this.abastecimentos.filter(a => a.id !== id); },
    });
  }

  abrirNovo() {
    this.editandoId = null;
    this.form.reset({ caminhaoId: null, data: '', litros: null, custoTotal: null });
    this.showForm = true;
  }

  abrirEdicao(item: AbastecimentoModel) {
    this.editandoId = item.id ?? null;
    this.form.reset({
      caminhaoId: item.caminhaoId,
      data: item.data?.slice(0, 10),
      litros: item.litros,
      custoTotal: item.custoTotal,
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
      litros: Number(valorForm.litros),
      custoTotal: Number(valorForm.custoTotal),
    };

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
}
