import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { CustoFixoAjusteModel, CustoFixoModel } from '../../../models/custo-fixo.model';
import { CustoFixoService } from '../../../services/custo-fixo.service';
import { CaminhaoModel } from '../../../models/caminhao.model';
import { CaminhaoService } from '../../../services/caminhao.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-custo-fixo',
  imports: [Menu, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './custo-fixo.html',
  styleUrl: './custo-fixo.scss',
})
export class CustoFixo {
  isLoading = true;
  erro = false;
  custosFixos: CustoFixoModel[] = [];
  caminhoes: CaminhaoModel[] = [];

  categorias = ['IPVA', 'Seguro', 'Financiamento', 'Outro'];
  meses = [
    { valor: 1, nome: 'Jan' }, { valor: 2, nome: 'Fev' }, { valor: 3, nome: 'Mar' },
    { valor: 4, nome: 'Abr' }, { valor: 5, nome: 'Mai' }, { valor: 6, nome: 'Jun' },
    { valor: 7, nome: 'Jul' }, { valor: 8, nome: 'Ago' }, { valor: 9, nome: 'Set' },
    { valor: 10, nome: 'Out' }, { valor: 11, nome: 'Nov' }, { valor: 12, nome: 'Dez' },
  ];

  showForm = false;
  salvando = false;
  editandoId: number | null = null;

  expandidoId: number | null = null;
  ajustesPorCustoFixo: Record<number, CustoFixoAjusteModel[]> = {};
  carregandoAjustes = false;
  salvandoAjuste = false;
  novoAjuste = { mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), valor: null as number | null };

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

  constructor(
    private service: CustoFixoService,
    private caminhaoService: CaminhaoService,
    private toast: ToastService,
  ) {}

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

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar este custo fixo?')) return;
    this.service.deletar(id).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.custosFixos = this.custosFixos.filter(c => c.id !== id);
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }

  toggleAjustes(item: CustoFixoModel) {
    if (!item.id) return;
    if (this.expandidoId === item.id) {
      this.expandidoId = null;
      return;
    }
    this.expandidoId = item.id;
    this.novoAjuste = { mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), valor: null };
    if (!this.ajustesPorCustoFixo[item.id]) {
      this.carregandoAjustes = true;
      this.service.listarAjustes(item.id).subscribe({
        next: (ajustes) => {
          this.ajustesPorCustoFixo[item.id!] = ajustes;
          this.carregandoAjustes = false;
        },
        error: () => { this.carregandoAjustes = false; },
      });
    }
  }

  salvarAjuste(custoFixoId: number) {
    if (!this.novoAjuste.mes || !this.novoAjuste.ano || this.novoAjuste.valor == null) {
      this.toast.erro('Preencha mês, ano e valor do ajuste.');
      return;
    }
    this.salvandoAjuste = true;
    this.service.salvarAjuste(custoFixoId, {
      mes: this.novoAjuste.mes,
      ano: this.novoAjuste.ano,
      valor: Number(this.novoAjuste.valor),
    }).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.salvandoAjuste = false;
        this.novoAjuste = { mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), valor: null };
        this.service.listarAjustes(custoFixoId).subscribe({
          next: (ajustes) => {
            this.ajustesPorCustoFixo[custoFixoId] = ajustes;
            this.atualizarTotalAjustes(custoFixoId, ajustes.length);
          },
        });
      },
      error: () => {
        this.toast.erro('Erro ao comunicar com o servidor.');
        this.salvandoAjuste = false;
      },
    });
  }

  removerAjuste(ajuste: CustoFixoAjusteModel) {
    if (!confirm('Remover este ajuste? O valor volta a ser o padrão nesse mês.')) return;
    this.service.removerAjuste(ajuste.id).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        this.ajustesPorCustoFixo[ajuste.custoFixoId] = this.ajustesPorCustoFixo[ajuste.custoFixoId].filter(a => a.id !== ajuste.id);
        this.atualizarTotalAjustes(ajuste.custoFixoId, this.ajustesPorCustoFixo[ajuste.custoFixoId].length);
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }

  private atualizarTotalAjustes(custoFixoId: number, total: number) {
    const custoFixo = this.custosFixos.find(c => c.id === custoFixoId);
    if (custoFixo) custoFixo.totalAjustes = total;
  }

  nomeMes(mes: number): string {
    return this.meses.find(m => m.valor === mes)?.nome ?? String(mes);
  }
}
