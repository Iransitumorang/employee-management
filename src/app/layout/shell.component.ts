import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <header class="topbar">
      <div>
        <p class="eyebrow">Backoffice</p>
        <h1 class="topbar-title">Employee Management</h1>
      </div>
      <div class="user-menu">
        <button class="ghost user-btn" type="button" (click)="toggleMenu()">
          <span class="avatar">{{ getInitial() }}</span>
          {{ auth.currentUser() || 'User' }} ▾
        </button>
        @if (menuOpen()) {
          <div class="dropdown-menu">
            <button class="dropdown-item danger" type="button" (click)="confirmLogout()">Logout</button>
          </div>
        }
      </div>
    </header>
    <main class="page-shell"><router-outlet /></main>
  `,
})
export class ShellComponent {
  readonly menuOpen = signal(false);

  constructor(readonly auth: AuthService) { }

  getInitial(): string {
    const user = this.auth.currentUser();
    return user ? user.charAt(0).toUpperCase() : 'U';
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  confirmLogout() {
    this.menuOpen.set(false);
    if (confirm('Apakah Anda yakin ingin keluar dari Employee Management?')) {
      this.auth.logout();
    }
  }
}
