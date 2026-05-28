import { Component } from '@angular/core';
import { Menu } from '../../components/menu/menu';
import { MotoristaModel } from '../../../models/motorista.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-motorista',
  imports: [Menu, CommonModule],
  templateUrl: './motorista.html',
  styleUrl: './motorista.scss',
})
export class Motorista {
  isLoading = true;

  motoristas: MotoristaModel[] = [
    {
      nome: 'João Silva',
      nascimento: '15/03/1985',
      nCarteira: '123456789'
    },
    {
      nome: 'Maria Oliveira',
      nascimento: '20/07/1990',
      nCarteira: '987654321'
    }
  ];

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);      
  }

}
