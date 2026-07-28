import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { FazendaContatoModel, FazendaModel } from '../../../models/fazenda.model';
import { FazendaService } from '../../../services/fazenda.service';
import { CidadeModel } from '../../../models/cidade.model';
import { CidadeService } from '../../../services/cidade.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-fazenda',
  imports: [Menu, CommonModule, ReactiveFormsModule, FormsModule],
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

  expandidoId: number | null = null;
  contatosPorFazenda: Record<number, FazendaContatoModel[]> = {};
  carregandoContatos = false;
  salvandoContato = false;
  novoContato = '';

  form = new FormGroup({
    nome:      new FormControl('', [Validators.required]),
    cidadeId:  new FormControl<number | null>(null),
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
    this.form.reset({ nome: '', cidadeId: null });
    this.showForm = true;
  }

  abrirEdicao(item: FazendaModel) {
    this.editandoId = item.id ?? null;
    this.form.reset({
      nome: item.nome,
      cidadeId: item.cidade_id ?? null,
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

  toggleContatos(fazenda: FazendaModel) {
    if (!fazenda.id) return;
    if (this.expandidoId === fazenda.id) {
      this.expandidoId = null;
      return;
    }
    this.expandidoId = fazenda.id;
    this.novoContato = '';
    if (!this.contatosPorFazenda[fazenda.id]) {
      this.carregandoContatos = true;
      this.service.listarContatos(fazenda.id).subscribe({
        next: (contatos) => {
          this.contatosPorFazenda[fazenda.id!] = contatos;
          this.carregandoContatos = false;
        },
        error: () => { this.carregandoContatos = false; },
      });
    }
  }

  adicionarContato(fazendaId: number) {
    const contato = this.novoContato.trim();
    if (!contato) {
      this.toast.erro('Digite o nome/telefone do contato.');
      return;
    }
    this.salvandoContato = true;
    this.service.adicionarContato(fazendaId, contato).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.salvandoContato = false;
        this.novoContato = '';
        this.service.listarContatos(fazendaId).subscribe({
          next: (contatos) => {
            this.contatosPorFazenda[fazendaId] = contatos;
            this.atualizarTotalContatos(fazendaId, contatos.length);
          },
        });
      },
      error: () => {
        this.toast.erro('Erro ao comunicar com o servidor.');
        this.salvandoContato = false;
      },
    });
  }

  removerContato(contato: FazendaContatoModel) {
    if (!confirm('Remover este contato?')) return;
    this.service.removerContato(contato.id).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.contatosPorFazenda[contato.fazendaId] = this.contatosPorFazenda[contato.fazendaId].filter(c => c.id !== contato.id);
        this.atualizarTotalContatos(contato.fazendaId, this.contatosPorFazenda[contato.fazendaId].length);
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }

  private atualizarTotalContatos(fazendaId: number, total: number) {
    const fazenda = this.fazendas.find(f => f.id === fazendaId);
    if (fazenda) fazenda.totalContatos = total;
  }
}
