import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { OficinaModel } from '../../../models/oficina.model';
import { OficinaService } from '../../../services/oficina.service';

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

  constructor(private service: OficinaService) {}

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
      next: () => { this.oficinas = this.oficinas.filter(o => o.id !== id); },
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
