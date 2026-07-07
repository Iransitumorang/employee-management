import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main class="auth-page">
      <section class="login-card">
        <h1>Login Backoffice</h1>
        <p class="muted">Masuk untuk mengelola data employee.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
          <label>Username
            <input formControlName="username" placeholder="admin" />
          </label>
          <label>Password
            <input formControlName="password" type="password" placeholder="admin123" />
          </label>

          @if (error()) {
            <div class="alert danger">Username atau password salah.</div>
          }

          <button class="primary full" type="submit">Login</button>
        </form>
      </section>
    </main>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly error = signal(false);
  readonly form = this.fb.nonNullable.group({
    username: ['admin', Validators.required],
    password: ['admin123', Validators.required],
  });

  constructor(private readonly auth: AuthService, private readonly router: Router) { }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password } = this.form.getRawValue();
    if (this.auth.login(username, password)) {
      this.router.navigate(['/employees']);
      return;
    }
    this.error.set(true);
  }
}
