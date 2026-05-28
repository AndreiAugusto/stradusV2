import { Component } from '@angular/core';
import { Menu } from '../../components/menu/menu';
import { OficinaModel } from '../../../models/oficina.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oficina',
  imports: [Menu, CommonModule],
  templateUrl: './oficina.html',
  styleUrl: './oficina.scss',
})
export class Oficina {
  isLoading = true;

  oficinas: OficinaModel[] = [
    {
      nome: 'Sena Pneus',
      telefone: '(65) 99999-9999',
      endereco: 'Várzea Grande',
      email: 'email@email.com'
    },
    {
      nome: 'Tecnovolvo',
      telefone: '(65) 98765-4321',
      endereco: 'Cuiabá',
      email: 'email@email.com'
    }
  ];

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);      
  }

}
