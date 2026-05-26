import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
    },
    {
        path: 'caminhao',
        loadComponent: () => import('./pages/caminhao/caminhao').then(m => m.Caminhao)
    },
    {
        path: 'oficina',
        loadComponent: () => import('./pages/oficina/oficina').then(m => m.Oficina)
    },
    {
        path: 'motorista',
        loadComponent: () => import('./pages/motorista/motorista').then(m => m.Motorista)
    },
    {
        path: 'manutencao',
        loadComponent: () => import('./pages/manutencao/manutencao').then(m => m.Manutencao)
    }
];
