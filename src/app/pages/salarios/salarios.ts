import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Menu } from '../../components/menu/menu';
import { SalarioMotorista } from '../../../models/salario.model';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-salarios',
  imports: [Menu, CommonModule, FormsModule],
  templateUrl: './salarios.html',
  styleUrl: './salarios.scss',
})
export class Salarios {
  isLoading = true;
  erro = false;
  salarios: SalarioMotorista[] = [];

  meses = [
    { valor: 1, nome: 'Janeiro' }, { valor: 2, nome: 'Fevereiro' }, { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' }, { valor: 5, nome: 'Maio' }, { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' }, { valor: 8, nome: 'Agosto' }, { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' }, { valor: 11, nome: 'Novembro' }, { valor: 12, nome: 'Dezembro' },
  ];
  anos: number[] = [];

  mesSelecionado = new Date().getMonth() + 1;
  anoSelecionado = new Date().getFullYear();

  get totalFretes() { return this.salarios.reduce((s, m) => s + Number(m.totalFretes), 0); }
  get totalBruto() { return this.salarios.reduce((s, m) => s + Number(m.totalFretesBruto), 0); }
  get totalSalarios() { return this.salarios.reduce((s, m) => s + Number(m.totalReceber), 0); }

  constructor(private service: DashboardService) {
    const anoAtual = new Date().getFullYear();
    for (let a = anoAtual - 3; a <= anoAtual + 1; a++) this.anos.push(a);
  }

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.isLoading = true;
    this.erro = false;
    this.service.salariosMes(this.mesSelecionado, this.anoSelecionado).subscribe({
      next: (data) => {
        this.salarios = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }
}
