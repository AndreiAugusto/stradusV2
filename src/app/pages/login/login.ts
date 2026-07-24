import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {}

  loginForm = new FormGroup({
    email:    new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    if (localStorage.getItem('accessToken')) {
      this.router.navigate(['/home']);
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.auth.login({
      email:    this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
    }).subscribe({
      next: (response) => {
        localStorage.setItem('accessToken', response.accessToken);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.toast.erro('Email ou senha inválidos.');
        this.isLoading = false;
      },
    });
  }
}
