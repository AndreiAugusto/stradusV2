import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Menu } from '../../components/menu/menu';
import { AbastecimentoModel } from '../../../models/abastecimento.model';
import { AbastecimentoService } from '../../../services/abastecimento.service';

@Component({
  selector: 'app-abastecimento',
  imports: [Menu, CommonModule],
  templateUrl: './abastecimento.html',
  styleUrl: './abastecimento.scss',
})
export class Abastecimento {
  isLoading = true;
  erro = false;
  abastecimentos: AbastecimentoModel[] = [];

  get totalGasto()  { return this.abastecimentos.reduce((s, a) => s + a.custoTotal, 0); }
  get totalLitros() { return this.abastecimentos.reduce((s, a) => s + a.litros, 0); }
  get precioMedio() {
    return this.totalLitros ? this.totalGasto / this.totalLitros : 0;
  }

  constructor(private service: AbastecimentoService) {}

  ngOnInit() {
    this.service.listar().subscribe({
      next: (data) => {
        this.abastecimentos = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar este abastecimento?')) return;
    this.service.deletar(id).subscribe({
      next: () => { this.abastecimentos = this.abastecimentos.filter(a => a.id !== id); },
    });
  }
}
