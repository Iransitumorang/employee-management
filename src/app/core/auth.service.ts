import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'employee-management-auth';
  readonly isLoggedIn = signal(localStorage.getItem(this.storageKey) === 'true');

  constructor(private readonly router: Router) {}

  login(username: string, password: string): boolean {
    const valid = username === 'admin' && password === 'admin123';
    if (valid) {
      localStorage.setItem(this.storageKey, 'true');
      this.isLoggedIn.set(true);
    }
    return valid;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }
}
