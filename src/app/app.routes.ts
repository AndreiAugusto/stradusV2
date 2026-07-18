import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'frete',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/frete/frete').then(m => m.Frete),
  },
  {
    path: 'abastecimento',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/abastecimento/abastecimento').then(m => m.Abastecimento),
  },
  {
    path: 'manutencao',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/manutencao/manutencao').then(m => m.Manutencao),
  },
  {
    path: 'custo-fixo',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/custo-fixo/custo-fixo').then(m => m.CustoFixo),
  },
  {
    path: 'extrato',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/extrato/extrato').then(m => m.Extrato),
  },
  {
    path: 'salarios',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/salarios/salarios').then(m => m.Salarios),
  },
  {
    path: 'caminhao',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/caminhao/caminhao').then(m => m.Caminhao),
  },
  {
    path: 'oficina',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/oficina/oficina').then(m => m.Oficina),
  },
  {
    path: 'motorista',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/motorista/motorista').then(m => m.Motorista),
  },
];
