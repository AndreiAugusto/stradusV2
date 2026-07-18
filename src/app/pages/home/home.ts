import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Menu } from '../../components/menu/menu';
import { DashboardService } from '../../../services/dashboard.service';
import { ResumoDashboard, UltimaMovimentacao } from '../../../models/dashboard.model';

@Component({
  selector: 'app-home',
  imports: [Menu, CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  isLoading = true;
  isLoadingMovimentacoes = true;
  erro = false;

  resumo: ResumoDashboard = {
    mes:        0,
    ano:        0,
    fretes: {
      total: 0,
      receitaBruta: 0
    },
    manutencoes: {
      total: 0,
      custo: 0
    },
    abastecimentos: {
      total: 0,
      custo: 0
    },
    custosFixos: {
      total: 0,
      custo: 0
    },
    salarios: {
      custo: 0
    },
    saldoLiquido:              0,
  };

  movimentacoes: UltimaMovimentacao[] = [];

  get totalDespesas() {
    return this.resumo.manutencoes.custo + this.resumo.abastecimentos.custo + this.resumo.custosFixos.custo + this.resumo.salarios.custo;
  }

  ngOnInit(): void {
    this.dashboard.resumoMes().subscribe({
      next: (data) => {
        this.resumo = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });

    this.dashboard.ultimasMovimentacoes(8).subscribe({
      next: (data) => {
        this.movimentacoes = data;
        this.isLoadingMovimentacoes = false;
      },
      error: () => {
        this.isLoadingMovimentacoes = false;
      },
    });
  }

  navegarParaMovimentacao(mov: UltimaMovimentacao): void {
    const rotas: Record<string, string> = {
      frete: '/frete',
      abastecimento: '/abastecimento',
      manutencao: '/manutencao',
    };
    this.router.navigate([rotas[mov.tipo]]);
  }

  iconeMovimentacao(tipo: string): string {
    const icones: Record<string, string> = {
      frete: 'bi-box-seam-fill',
      abastecimento: 'bi-fuel-pump-fill',
      manutencao: 'bi-wrench-adjustable',
    };
    return icones[tipo] ?? 'bi-circle';
  }

  corMovimentacao(tipo: string): string {
    const cores: Record<string, string> = {
      frete: '#10B981',
      abastecimento: '#F59E0B',
      manutencao: '#EF4444',
    };
    return cores[tipo] ?? '#6B7280';
  }

  labelTipo(tipo: string): string {
    const labels: Record<string, string> = {
      frete: 'Frete',
      abastecimento: 'Abastecimento',
      manutencao: 'Manutenção',
    };
    return labels[tipo] ?? tipo;
  }

  constructor(private dashboard: DashboardService, private router: Router) {}
}
