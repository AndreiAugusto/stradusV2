import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() text: string = '';
  @Input() link1: string = '';
  @Input() link2: string = '';
  
  isLoading: boolean = true;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarDados(): void {
    // Exemplo com setTimeout (simular delay da API)
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }
}

