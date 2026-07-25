import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  isOpen = false;

  toggle() {
    this.isOpen = !this.isOpen;
  }

  close() {
    this.isOpen = false;
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 991.98) {
      this.isOpen = false;
    }
  }

  sair() {
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  }
}
