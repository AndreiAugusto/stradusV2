import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Menu } from '../../components/menu/menu';
import { SeletorNotas } from '../../components/seletor-notas/seletor-notas';
import { Notas } from '../../components/notas/notas';
import { SalarioMotorista } from '../../../models/salario.model';
import { AdiantamentoModel, ParcelaAdiantamento } from '../../../models/adiantamento.model';
import { MotoristaModel } from '../../../models/motorista.model';
import { DashboardService } from '../../../services/dashboard.service';
import { AdiantamentoService } from '../../../services/adiantamento.service';
import { MotoristaService } from '../../../services/motorista.service';
import { NotaService, mensagemErroUpload } from '../../../services/nota.service';
import { ToastService } from '../../../services/toast.service';

const MAXIMO_PARCELAS = 24;

@Component({
  selector: 'app-salarios',
  imports: [Menu, CommonModule, FormsModule, ReactiveFormsModule, SeletorNotas, Notas],
  templateUrl: './salarios.html',
  styleUrl: './salarios.scss',
})
export class Salarios {
  isLoading = true;
  erro = false;
  salarios: SalarioMotorista[] = [];
  adiantamentos: AdiantamentoModel[] = [];
  motoristas: MotoristaModel[] = [];

  meses = [
    { valor: 1, nome: 'Janeiro' }, { valor: 2, nome: 'Fevereiro' }, { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' }, { valor: 5, nome: 'Maio' }, { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' }, { valor: 8, nome: 'Agosto' }, { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' }, { valor: 11, nome: 'Novembro' }, { valor: 12, nome: 'Dezembro' },
  ];
  anos: number[] = [];
  opcoesParcelas = Array.from({ length: MAXIMO_PARCELAS }, (_, i) => i + 1);

  mesSelecionado = new Date().getMonth() + 1;
  anoSelecionado = new Date().getFullYear();

  showForm = false;
  salvando = false;
  editandoId: number | null = null;
  /** Notas escolhidas no modal — só são enviadas depois que o adiantamento é salvo (precisa do id). */
  notasPendentes: File[] = [];

  detalhe: AdiantamentoModel | null = null;

  form = new FormGroup({
    motoristaId:    new FormControl<number | null>(null, [Validators.required]),
    data:           new FormControl('', [Validators.required]),
    valor:          new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    numeroParcelas: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required] }),
    mesInicio:      new FormControl<number | null>(null, [Validators.required]),
    anoInicio:      new FormControl<number | null>(null, [Validators.required]),
    observacao:     new FormControl(''),
  });

  get totalFretes() { return this.salarios.reduce((s, m) => s + Number(m.totalFretes), 0); }
  get totalBruto() { return this.salarios.reduce((s, m) => s + Number(m.totalFretesBruto), 0); }
  get totalSalarios() { return this.salarios.reduce((s, m) => s + Number(m.totalReceber), 0); }
  get totalDescontos() { return this.salarios.reduce((s, m) => s + Number(m.totalAdiantamentos), 0); }
  get totalAdiantadoNoMes() { return this.salarios.reduce((s, m) => s + Number(m.adiantadoNoMes), 0); }
  get totalAPagar() { return this.salarios.reduce((s, m) => s + this.aPagar(m), 0); }
  get totalMotoristasDevem() { return this.salarios.reduce((s, m) => s + this.motoristaDeve(m), 0); }

  /** Comissão + adiantado no mês − descontos; nunca negativo (o excedente o motorista fica devendo). */
  aPagar(s: SalarioMotorista) { return Math.max(Number(s.totalMes), 0); }

  /** Quando o desconto do mês passa da comissão: quanto do adiantamento o motorista ainda deve. */
  motoristaDeve(s: SalarioMotorista) { return Math.max(-Number(s.totalMes), 0); }

  get nomeMesSelecionado() { return this.nomeMes(this.mesSelecionado); }

  /** Como o valor do formulário vai ser dividido (mesma regra do backend). */
  get previewParcelas(): ParcelaAdiantamento[] {
    const { valor, numeroParcelas, mesInicio, anoInicio } = this.form.getRawValue();
    if (!valor || valor <= 0 || !numeroParcelas || !mesInicio || !anoInicio) return [];
    return dividirEmParcelas(Number(valor), numeroParcelas, mesInicio, anoInicio);
  }

  constructor(
    private service: DashboardService,
    private adiantamentoService: AdiantamentoService,
    private motoristaService: MotoristaService,
    private notaService: NotaService,
    private toast: ToastService,
  ) {
    const anoAtual = new Date().getFullYear();
    for (let a = anoAtual - 3; a <= anoAtual + 2; a++) this.anos.push(a);
  }

  ngOnInit() {
    this.carregar();
    this.motoristaService.listar().subscribe({ next: (data) => { this.motoristas = data; } });

    // Ao escolher a data do adiantamento, sugere começar a descontar do salário daquele mês.
    this.form.controls.data.valueChanges.subscribe((data) => {
      if (!data) return;
      const [ano, mes] = data.split('-').map(Number);
      this.form.patchValue({ mesInicio: mes, anoInicio: ano }, { emitEvent: false });
    });
  }

  carregar() {
    this.isLoading = true;
    this.erro = false;
    forkJoin({
      salarios: this.service.salariosMes(this.mesSelecionado, this.anoSelecionado),
      adiantamentos: this.adiantamentoService.listarDoMes(this.mesSelecionado, this.anoSelecionado),
    }).subscribe({
      next: ({ salarios, adiantamentos }) => {
        this.salarios = salarios;
        this.adiantamentos = adiantamentos;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  nomeMes(mes: number) {
    return this.meses.find((m) => m.valor === mes)?.nome ?? '';
  }

  /** Entregue ao motorista no mês selecionado. */
  feitoNoMes(a: AdiantamentoModel) {
    return a.data?.slice(0, 7) === `${this.anoSelecionado}-${String(this.mesSelecionado).padStart(2, '0')}`;
  }

  /** Parcela descontada do salário do mês selecionado (undefined se não houver). */
  parcelaDoMes(a: AdiantamentoModel) {
    return a.parcelas?.find((p) => p.mes === this.mesSelecionado && p.ano === this.anoSelecionado);
  }

  /** Adiantamentos de um motorista com parcela descontada do salário do mês selecionado. */
  descontadosNoMes(motoristaId: number) {
    return this.adiantamentos.filter((a) => a.motoristaId === motoristaId && this.parcelaDoMes(a));
  }

  /** Adiantamentos entregues no mês selecionado a um motorista. */
  adiantadosNoMes(motoristaId: number) {
    return this.adiantamentos.filter((a) => a.motoristaId === motoristaId && this.feitoNoMes(a));
  }

  /** "Outubro/2026" ou "Outubro/2026 a Novembro/2026". */
  periodoDesconto(a: AdiantamentoModel) {
    const parcelas = a.parcelas ?? [];
    if (parcelas.length === 0) return '—';
    const primeira = parcelas[0];
    const ultima = parcelas[parcelas.length - 1];
    const inicio = `${this.nomeMes(primeira.mes)}/${primeira.ano}`;
    return parcelas.length === 1 ? inicio : `${inicio} a ${this.nomeMes(ultima.mes)}/${ultima.ano}`;
  }

  invalido(campo: string) {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  abrirNovo(motoristaId: number | null = null) {
    this.editandoId = null;
    this.notasPendentes = [];
    const hoje = new Date();
    const data = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    this.form.reset({ motoristaId, data: '', valor: null, numeroParcelas: 1, mesInicio: null, anoInicio: null, observacao: '' });
    this.form.controls.data.setValue(data);
    this.showForm = true;
  }

  abrirEdicao(item: AdiantamentoModel) {
    this.editandoId = item.id ?? null;
    this.notasPendentes = [];
    const primeira = item.parcelas?.[0];
    if (primeira && !this.anos.includes(primeira.ano)) {
      this.anos = [...this.anos, primeira.ano].sort((x, y) => x - y);
    }
    this.form.reset({
      motoristaId: item.motoristaId,
      data: item.data?.slice(0, 10),
      valor: item.valor,
      numeroParcelas: item.parcelas?.length || 1,
      mesInicio: primeira?.mes ?? null,
      anoInicio: primeira?.ano ?? null,
      observacao: item.observacao ?? '',
    }, { emitEvent: false });
    this.showForm = true;
  }

  fecharForm() {
    this.showForm = false;
  }

  abrirDetalhe(item: AdiantamentoModel) {
    this.detalhe = item;
  }

  fecharDetalhe() {
    this.detalhe = null;
  }

  editarDoDetalhe(item: AdiantamentoModel) {
    this.detalhe = null;
    this.abrirEdicao(item);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: AdiantamentoModel = {
      motoristaId: v.motoristaId!,
      data: v.data!,
      valor: Number(v.valor),
      numeroParcelas: v.numeroParcelas,
      mesInicio: v.mesInicio!,
      anoInicio: v.anoInicio!,
      observacao: v.observacao?.trim() || null,
    };

    this.salvando = true;
    const request = this.editandoId
      ? this.adiantamentoService.atualizar(this.editandoId, payload)
      : this.adiantamentoService.criar(payload);

    request.subscribe({
      next: (res: any) => {
        if (res?.error) {
          this.toast.deResposta(res);
          this.salvando = false;
          return;
        }
        const id = this.editandoId ?? res?.id;
        if (!id || this.notasPendentes.length === 0) {
          this.concluirSalvar(res);
          return;
        }
        this.notaService.enviarTodos(this.notasPendentes, { adiantamentoId: id }).subscribe({
          next: () => this.concluirSalvar(res),
          error: (err) => {
            this.toast.erro(`Adiantamento salvo, mas a nota não foi enviada: ${mensagemErroUpload(err)}`);
            this.concluirSalvar(null);
          },
        });
      },
      error: () => {
        this.toast.erro('Erro ao comunicar com o servidor.');
        this.salvando = false;
      },
    });
  }

  private concluirSalvar(res: any) {
    if (res) this.toast.deResposta(res);
    this.salvando = false;
    this.showForm = false;
    this.notasPendentes = [];
    this.carregar();
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja remover este adiantamento? As notas anexadas também serão excluídas.')) return;
    this.adiantamentoService.deletar(id).subscribe({
      next: (res) => {
        this.toast.deResposta(res);
        if (this.detalhe?.id === id) this.detalhe = null;
        this.carregar();
      },
      error: () => this.toast.erro('Erro ao comunicar com o servidor.'),
    });
  }
}

/** Parcelas iguais a partir de mesInicio/anoInicio; a última absorve a diferença de centavos. */
function dividirEmParcelas(valor: number, numeroParcelas: number, mesInicio: number, anoInicio: number): ParcelaAdiantamento[] {
  const valorParcela = Math.round((valor / numeroParcelas) * 100) / 100;
  return Array.from({ length: numeroParcelas }, (_, i) => {
    const indiceMes = anoInicio * 12 + (mesInicio - 1) + i;
    return {
      numero: i + 1,
      mes: (indiceMes % 12) + 1,
      ano: Math.floor(indiceMes / 12),
      valor: i < numeroParcelas - 1
        ? valorParcela
        : Math.round((valor - valorParcela * (numeroParcelas - 1)) * 100) / 100,
    };
  });
}
