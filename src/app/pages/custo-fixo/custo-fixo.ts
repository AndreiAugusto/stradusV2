import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { CustoFixoModel } from '../../../models/custo-fixo.model';
import { CustoFixoService } from '../../../services/custo-fixo.service';
import { CaminhaoModel } from '../../../models/caminhao.model';
import { CaminhaoService } from '../../../services/caminhao.service';

@Component({
  selector: 'app-custo-fixo',
  imports: [Menu, CommonModule, ReactiveFormsModule],
  templateUrl: './custo-fixo.html',
  styleUrl: './custo-fixo.scss',
})
export class CustoFixo {
  isLoading = true;
  erro = false;
  custosFixos: CustoFixoModel[] = [];
  caminhoes: CaminhaoModel[] = [];

  categorias = ['IPVA', 'Seguro', 'Financiamento', 'Outro'];

  showForm = false;
  salvando = false;
  editandoId: number | null = null;

  form = new FormGroup({
    descricao:      new FormControl('', [Validators.required]),
    categoria:      new FormControl(''),
    valor:          new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    caminhaoId:     new FormControl<number | null>(null),
    diaVencimento:  new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.max(31)]),
    dataInicio:     new FormControl('', [Validators.required]),
    dataFim:        new FormControl(''),
  });

  get totalMensal() {
    return this.custosFixos.reduce((s, c) => s + (Number(c.valor) || 0), 0);
  }

  constructor(private service: CustoFixoService, private caminhaoService: CaminhaoService) {}

  ngOnInit() {
    this.carregar();
    this.caminhaoService.listar().subscribe({
      next: (data) => { this.caminhoes = data; },
    });
  }

  carregar() {
    this.isLoading = true;
    this.service.listar().subscribe({
      next: (data) => {
        this.custosFixos = data;
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
    this.form.reset({ descricao: '', categoria: '', valor: null, caminhaoId: null, diaVencimento: null, dataInicio: '', dataFim: '' });
    this.showForm = true;
  }

  abrirEdicao(item: CustoFixoModel) {
    this.editandoId = item.id ?? null;
    this.form.reset({
      descricao: item.descricao,
      categoria: item.categoria ?? '',
      valor: item.valor,
      caminhaoId: item.caminhaoId ?? null,
      diaVencimento: item.diaVencimento,
      dataInicio: item.dataInicio?.slice(0, 10),
      dataFim: item.dataFim ? item.dataFim.slice(0, 10) : '',
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
    const payload: CustoFixoModel = {
      descricao: valorForm.descricao!,
      categoria: valorForm.categoria || undefined,
      valor: Number(valorForm.valor),
      caminhaoId: valorForm.caminhaoId ?? undefined,
      diaVencimento: Number(valorForm.diaVencimento),
      dataInicio: valorForm.dataInicio!,
      dataFim: valorForm.dataFim || undefined,
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

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar este custo fixo?')) return;
    this.service.deletar(id).subscribe({
      next: () => { this.custosFixos = this.custosFixos.filter(c => c.id !== id); },
    });
  }
}
