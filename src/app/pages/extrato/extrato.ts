import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { ExtratoFiltro, ExtratoItem } from '../../../models/extrato.model';
import { ExtratoService } from '../../../services/extrato.service';
import { CaminhaoModel } from '../../../models/caminhao.model';
import { CaminhaoService } from '../../../services/caminhao.service';
import { MotoristaModel } from '../../../models/motorista.model';
import { MotoristaService } from '../../../services/motorista.service';
import { intervaloMesAtual } from '../../../utils/periodo.util';

type Coluna = 'data' | 'placa' | 'motorista' | 'empresa' | 'historico' | 'despesas' | 'receitas';

@Component({
  selector: 'app-extrato',
  imports: [Menu, CommonModule, FormsModule],
  templateUrl: './extrato.html',
})
export class Extrato {
  isLoading = true;
  erro = false;
  itens: ExtratoItem[] = [];

  caminhoes: CaminhaoModel[] = [];
  motoristas: MotoristaModel[] = [];

  tiposDisponiveis: { valor: ExtratoItem['tipo']; label: string }[] = [
    { valor: 'frete', label: 'Frete' },
    { valor: 'abastecimento', label: 'Abastecimento' },
    { valor: 'manutencao', label: 'Manutenção' },
    { valor: 'custo-fixo', label: 'Custo Fixo' },
    { valor: 'salario-motorista', label: 'Salário Motorista' },
  ];

  filtro: {
    dataInicio: string;
    dataFim: string;
    tipos: Record<ExtratoItem['tipo'], boolean>;
    caminhaoId: number | null;
    motoristaId: number | null;
  } = {
    ...intervaloMesAtual(),
    tipos: { frete: true, abastecimento: true, manutencao: true, 'custo-fixo': true, 'salario-motorista': true },
    caminhaoId: null,
    motoristaId: null,
  };

  sortColuna: Coluna = 'data';
  sortAsc = false;

  get totalDespesas() { return this.itens.reduce((s, i) => s + (i.despesas ?? 0), 0); }
  get totalReceitas() { return this.itens.reduce((s, i) => s + (i.receitas ?? 0), 0); }
  get saldo() { return this.totalReceitas - this.totalDespesas; }

  get itensOrdenados() {
    const dir = this.sortAsc ? 1 : -1;
    return [...this.itens].sort((a, b) => {
      const va = a[this.sortColuna];
      const vb = b[this.sortColuna];
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }

  constructor(
    private service: ExtratoService,
    private caminhaoService: CaminhaoService,
    private motoristaService: MotoristaService,
  ) {}

  ngOnInit() {
    this.carregar();
    this.caminhaoService.listar().subscribe({ next: (data) => { this.caminhoes = data; } });
    this.motoristaService.listar().subscribe({ next: (data) => { this.motoristas = data; } });
  }

  private requisicaoAtual = 0;

  carregar() {
    this.isLoading = true;
    this.erro = false;

    const tiposSelecionados = this.tiposDisponiveis
      .map((t) => t.valor)
      .filter((tipo) => this.filtro.tipos[tipo]);

    const filtroReq: ExtratoFiltro = {
      dataInicio: this.filtro.dataInicio || undefined,
      dataFim: this.filtro.dataFim || undefined,
      tipos: tiposSelecionados.length < this.tiposDisponiveis.length ? tiposSelecionados : undefined,
      caminhaoId: this.filtro.caminhaoId ?? undefined,
      motoristaId: this.filtro.motoristaId ?? undefined,
    };

    // Trocar dois filtros em sequência (ex: data início e data fim) dispara duas
    // requisições; sem essa guarda a resposta mais lenta podia sobrescrever a mais
    // recente e mostrar dados de um filtro que não é mais o selecionado na tela.
    const idRequisicao = ++this.requisicaoAtual;

    this.service.listar(filtroReq).subscribe({
      next: (data) => {
        if (idRequisicao !== this.requisicaoAtual) return;
        this.itens = data;
        this.isLoading = false;
      },
      error: () => {
        if (idRequisicao !== this.requisicaoAtual) return;
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  ordenarPor(coluna: Coluna) {
    if (this.sortColuna === coluna) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColuna = coluna;
      this.sortAsc = coluna === 'data' ? false : true;
    }
  }

  limparFiltros() {
    this.filtro = {
      dataInicio: '',
      dataFim: '',
      tipos: { frete: true, abastecimento: true, manutencao: true, 'custo-fixo': true, 'salario-motorista': true },
      caminhaoId: null,
      motoristaId: null,
    };
    this.carregar();
  }

  labelTipo(tipo: ExtratoItem['tipo']): string {
    return this.tiposDisponiveis.find((t) => t.valor === tipo)?.label ?? tipo;
  }

  corTipo(tipo: ExtratoItem['tipo']): string {
    const cores: Record<ExtratoItem['tipo'], string> = {
      frete: '#10B981',
      abastecimento: '#F59E0B',
      manutencao: '#EF4444',
      'custo-fixo': '#EF4444',
      'salario-motorista': '#EF4444',
    };
    return cores[tipo];
  }
}
