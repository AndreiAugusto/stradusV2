import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Caminhao } from '../../../services/caminhao';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  submitted = false;
  isLoading = false;
  
  constructor(
    private caminhaoService: Caminhao,
    private router: Router
  ) {}

  loginForm = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required])
  });

  ngOnInit() {
    // Verificar se o usuário já está logado
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Redirecionar para o home se o token existir
      this.router.navigate(['/home']);
    }
  }

  onSubmit(){
    this.submitted = true;
    this.isLoading = true;
    if(this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }
    this.caminhaoService.login({
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    }).subscribe(
      {
        next: (response: any) => {          
          // Salvar o accessToken no localStorage
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            console.log('Token salvo no localStorage');
          }
          this.router.navigate(['/home']);
        },
        error: (erro) => {
          console.error('Erro no login:', erro);
          this.isLoading = false;
        }
      }
    );
  }
}
