import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Menu } from '../../components/menu/menu';
import { CaminhaoModel } from '../../../models/caminhao.model';
import { CaminhaoService } from '../../../services/caminhao.service';

@Component({
  selector: 'app-caminhao',
  imports: [Menu, CommonModule],
  templateUrl: './caminhao.html',
  styleUrl: './caminhao.scss',
})
export class Caminhao {
  isLoading = true;
  erro = false;
  caminhoes: CaminhaoModel[] = [];

  constructor(private service: CaminhaoService) {}

  ngOnInit() {
    this.service.listar().subscribe({
      next: (data) => {
        this.caminhoes = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar este caminhão?')) return;
    this.service.deletar(id).subscribe({
      next: () => { this.caminhoes = this.caminhoes.filter(c => c.id !== id); },
    });
  }
}
