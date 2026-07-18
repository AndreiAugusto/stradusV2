import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { CaminhaoModel } from '../../../models/caminhao.model';
import { CaminhaoService } from '../../../services/caminhao.service';
import { ToastService } from '../../../services/toast.service';

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

  constructor(private service: CaminhaoService, private toast: ToastService) {}

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
}
