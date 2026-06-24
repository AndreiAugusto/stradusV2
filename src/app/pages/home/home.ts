import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Menu } from '../../components/menu/menu';
import { DashboardService } from '../../../services/dashboard.service';
import { ResumoDashboard } from '../../../models/dashboard.model';

@Component({
  selector: 'app-home',
  imports: [Menu, CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  isLoading = true;
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
    saldoLiquido:              0,
  };

  get totalDespesas() {
    return this.resumo.manutencoes.custo + this.resumo.abastecimentos.custo;
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
  }

  constructor(private dashboard: DashboardService) {}
}
