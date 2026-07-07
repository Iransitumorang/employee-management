import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <header class="topbar">
      <div>
        <p class="eyebrow">Backoffice</p>
        <h1 class="topbar-title">Employee Management</h1>
      </div>
      <button class="ghost" type="button" (click)="auth.logout()">Logout</button>
    </header>
    <main class="page-shell"><router-outlet /></main>
  `,
})
export class ShellComponent {
  constructor(readonly auth: AuthService) {}
}
