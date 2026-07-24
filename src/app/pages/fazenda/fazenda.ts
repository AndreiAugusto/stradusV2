import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { FazendaModel } from '../../../models/fazenda.model';
import { FazendaService } from '../../../services/fazenda.service';
import { CidadeModel } from '../../../models/cidade.model';
import { CidadeService } from '../../../services/cidade.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-fazenda',
  imports: [Menu, CommonModule, ReactiveFormsModule],
  templateUrl: './fazenda.html',
  styleUrl: './fazenda.scss',
})
export class Fazenda {
  isLoading = true;
  erro = false;
  fazendas: FazendaModel[] = [];
  cidades: CidadeModel[] = [];

  showForm = false;
  salvando = false;
  editandoId: number | null = null;

  form = new FormGroup({
    nome:      new FormControl('', [Validators.required]),
    cidadeId:  new FormControl<number | null>(null),
    contato:   new FormControl(''),
  });

  constructor(
    private service: FazendaService,
    private cidadeService: CidadeService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.carregar();
    this.cidadeService.listar().subscribe({ next: (data) => { this.cidades = data; } });
  }

  carregar() {
    this.isLoading = true;
    this.service.listar().subscribe({
      next: (data) => {
        this.fazendas = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar esta fazenda?')) return;
    this.service.deletar(id).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.fazendas = this.fazendas.filter(f => f.id !== id);
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }

  abrirNovo() {
    this.editandoId = null;
    this.form.reset({ nome: '', cidadeId: null, contato: '' });
    this.showForm = true;
  }

  abrirEdicao(item: FazendaModel) {
    this.editandoId = item.id ?? null;
    this.form.reset({
      nome: item.nome,
      cidadeId: item.cidade_id ?? null,
      contato: item.contato ?? '',
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
    const payload: FazendaModel = {
      nome: valorForm.nome!,
      cidadeId: valorForm.cidadeId ?? undefined,
      contato: valorForm.contato || undefined,
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
