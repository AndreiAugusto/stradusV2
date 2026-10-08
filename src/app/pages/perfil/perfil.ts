import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { PerfilModel, AtualizarPerfilModel } from '../../../models/usuario.model';
import { UsuarioService } from '../../../services/usuario.service';
import { ToastService } from '../../../services/toast.service';

function senhasIguais(group: AbstractControl): ValidationErrors | null {
  const nova = group.get('novaSenha')?.value;
  const confirmar = group.get('confirmarSenha')?.value;
  return nova && nova !== confirmar ? { senhasDiferentes: true } : null;
}

@Component({
  selector: 'app-perfil',
  imports: [Menu, CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil {
  isLoading = true;
  erro = false;
  salvando = false;
  perfil: PerfilModel | null = null;

  modo: 'dados' | 'senha' | null = null;

  formDados = new FormGroup({
    nome:       new FormControl('', [Validators.required]),
    email:      new FormControl('', [Validators.required, Validators.email]),
    senhaAtual: new FormControl('', [Validators.required]),
  });

  formSenha = new FormGroup(
    {
      novaSenha:      new FormControl('', [Validators.required, Validators.minLength(4)]),
      confirmarSenha: new FormControl('', [Validators.required]),
      senhaAtual:     new FormControl('', [Validators.required]),
    },
    { validators: senhasIguais },
  );

  constructor(private service: UsuarioService, private toast: ToastService) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.isLoading = true;
    this.service.buscarPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  abrirEdicaoDados() {
    this.formDados.reset({ nome: this.perfil?.nome ?? '', email: this.perfil?.email ?? '', senhaAtual: '' });
    this.modo = 'dados';
  }

  abrirAlterarSenha() {
    this.formSenha.reset({ novaSenha: '', confirmarSenha: '', senhaAtual: '' });
    this.modo = 'senha';
  }

  fecharForm() {
    this.modo = null;
  }

  invalido(form: FormGroup, campo: string) {
    const c = form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  salvarDados() {
    if (this.formDados.invalid) {
      this.formDados.markAllAsTouched();
      return;
    }

    const v = this.formDados.value;
    const payload: AtualizarPerfilModel = { senhaAtual: v.senhaAtual! };
    if (v.nome!.trim() !== this.perfil?.nome) payload.nome = v.nome!.trim();
    if (v.email!.trim() !== this.perfil?.email) payload.email = v.email!.trim();

    if (!payload.nome && !payload.email) {
      this.toast.erro('Nenhuma alteração para salvar.');
      return;
    }
    this.enviar(payload);
  }

  salvarSenha() {
    if (this.formSenha.invalid) {
      this.formSenha.markAllAsTouched();
      return;
    }
    const v = this.formSenha.value;
    this.enviar({ senhaAtual: v.senhaAtual!, novaSenha: v.novaSenha! });
  }

  private enviar(payload: AtualizarPerfilModel) {
    this.salvando = true;
    this.service.atualizarPerfil(payload).subscribe({
      next: (res) => {
        this.toast.sucesso(res.message);
        this.salvando = false;
        this.modo = null;
        this.carregar();
      },
      error: (err) => {
        this.toast.erro(err.error?.message ?? 'Erro ao comunicar com o servidor.');
        this.salvando = false;
      },
    });
  }
}
