import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  submitted = false;
  isLoading = false;
  loginError = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  loginForm = new FormGroup({
    email:    new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
  });

  ngOnInit() {
    if (localStorage.getItem('accessToken')) {
      this.router.navigate(['/home']);
    }
  }

  onSubmit() {
    this.submitted = true;
    this.loginError = false;

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
        this.loginError = true;
        this.isLoading = false;
      },
    });
  }
}
