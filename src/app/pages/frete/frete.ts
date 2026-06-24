import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Menu } from '../../components/menu/menu';
import { FreteModel } from '../../../models/frete.model';
import { FreteService } from '../../../services/frete.service';

@Component({
  selector: 'app-frete',
  imports: [Menu, CommonModule],
  templateUrl: './frete.html',
  styleUrl: './frete.scss',
})
export class Frete {
  isLoading = true;
  erro = false;
  fretes: FreteModel[] = [];

  get totalMes()    { return this.fretes.reduce((s, f) => s + f.valor, 0); }
  get quantidade()  { return this.fretes.length; }
  get ticketMedio() { return this.quantidade ? this.totalMes / this.quantidade : 0; }

  constructor(private service: FreteService) {}

  ngOnInit() {
    this.service.listar().subscribe({
      next: (data) => {
        this.fretes = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar este frete?')) return;
    this.service.deletar(id).subscribe({
      next: () => { this.fretes = this.fretes.filter(f => f.id !== id); },
    });
  }
}
