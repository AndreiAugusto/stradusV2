import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Menu } from '../../components/menu/menu';
import { MotoristaModel } from '../../../models/motorista.model';
import { MotoristaService } from '../../../services/motorista.service';

@Component({
  selector: 'app-motorista',
  imports: [Menu, CommonModule],
  templateUrl: './motorista.html',
  styleUrl: './motorista.scss',
})
export class Motorista {
  isLoading = true;
  erro = false;
  motoristas: MotoristaModel[] = [];

  constructor(private service: MotoristaService) {}

  ngOnInit() {
    this.service.listar().subscribe({
      next: (data) => {
        this.motoristas = data;
        this.isLoading = false;
      },
      error: () => {
        this.erro = true;
        this.isLoading = false;
      },
    });
  }

  deletar(id?: number) {
    if (!id || !confirm('Deseja deletar este motorista?')) return;
    this.service.deletar(id).subscribe({
      next: () => { this.motoristas = this.motoristas.filter(m => m.id !== id); },
    });
  }
}
