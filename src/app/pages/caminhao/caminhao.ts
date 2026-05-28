import { Component } from '@angular/core';
import { Menu } from '../../components/menu/menu';
import { CaminhaoModel } from '../../../models/caminhao.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-caminhao',
  imports: [Menu, CommonModule],
  templateUrl: './caminhao.html',
  styleUrl: './caminhao.scss',
})
export class Caminhao {
  isLoading = true;

  caminhoes: CaminhaoModel[] = [
    {
      placa: 'ABC-1234',
      modelo: 'Volvo FH',
      ano: '2020'
    },
    {
      placa: 'DEF-5678',  
      modelo: 'Scania R500',
      ano: '2019'
    },
  ];

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);      
  }
}
