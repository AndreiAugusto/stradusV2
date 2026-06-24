import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Menu } from '../../components/menu/menu';
import { ManutencaoModel } from '../../../models/manutencao.model';
import { ManutencaoService } from '../../../services/manutencao.service';

@Component({
  selector: 'app-manutencao',
  imports: [Menu, CommonModule],
  templateUrl: './manutencao.html',
  styleUrl: './manutencao.scss',
})
export class Manutencao {
  isLoading = true;
  erro = false;
  manutencoes: ManutencaoModel[] = [];

  get totalGasto() { return this.manutencoes.reduce((s, m) => s + (m.custo ?? 0), 0); }

  constructor(private service: ManutencaoService) {}

  ngOnInit() {
    this.service.listar().subscribe({
      next: (data) => {
        this.manutencoes = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar esta manutenção?')) return;
    this.service.deletar(id).subscribe({
      next: () => { this.manutencoes = this.manutencoes.filter(m => m.id !== id); },
    });
  }
}
