import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { MotoristaModel } from '../../../models/motorista.model';
import { MotoristaService } from '../../../services/motorista.service';
import { ToastService } from '../../../services/toast.service';

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

  constructor(private service: MotoristaService, private toast: ToastService) {}

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
}
