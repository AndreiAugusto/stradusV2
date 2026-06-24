import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Menu } from '../../components/menu/menu';
import { OficinaModel } from '../../../models/oficina.model';
import { OficinaService } from '../../../services/oficina.service';

@Component({
  selector: 'app-oficina',
  imports: [Menu, CommonModule],
  templateUrl: './oficina.html',
  styleUrl: './oficina.scss',
})
export class Oficina {
  isLoading = true;
  erro = false;
  oficinas: OficinaModel[] = [];

  constructor(private service: OficinaService) {}

  ngOnInit() {
    this.service.listar().subscribe({
      next: (data) => {
        this.oficinas = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar esta oficina?')) return;
    this.service.deletar(id).subscribe({
      next: () => { this.oficinas = this.oficinas.filter(o => o.id !== id); },
    });
  }
}
