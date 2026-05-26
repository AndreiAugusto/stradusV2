import { Component } from '@angular/core';
import { Menu } from '../../components/menu/menu';
import { Card } from '../../components/card/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [Menu, Card, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  isLoading: boolean = true;

  ngOnInit(): void {
    this.carregarDados();
  }
  carregarDados(): void {
    
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }
}
