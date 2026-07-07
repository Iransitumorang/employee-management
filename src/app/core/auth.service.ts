import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'employee-management-auth';
  private readonly userKey = 'employee-management-user';
  
  readonly isLoggedIn = signal(localStorage.getItem(this.storageKey) === 'true');
  readonly currentUser = signal(localStorage.getItem(this.userKey) || '');

  constructor(private readonly router: Router) {}

  login(username: string, password: string): boolean {
    const valid = username === 'admin' && password === 'admin123';
    if (valid) {
      localStorage.setItem(this.storageKey, 'true');
      localStorage.setItem(this.userKey, username);
      this.isLoggedIn.set(true);
      this.currentUser.set(username);
    }
    return valid;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.userKey);
    this.isLoggedIn.set(false);
    this.currentUser.set('');
    this.router.navigate(['/login']);
  }
}
