import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from '../../core/employee.service';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card detail-card">
      <p class="eyebrow">Employee Detail</p>
      @if (employee(); as data) {
        <div class="detail-header">
          <div class="profile-avatar-container" (click)="edit()" title="Klik untuk edit data employee">
            <div class="profile-avatar">
              {{ initials() }}
            </div>
            <div class="profile-avatar-overlay">
              <span class="edit-icon">✏️</span>
              <span class="edit-text">Edit</span>
            </div>
          </div>
          <div class="header-info">
            <h2>{{ toTitleCase(data.firstName + ' ' + data.lastName) }}</h2>
            <span class="badge" [ngClass]="data.status.toLowerCase()">{{ data.status }}</span>
          </div>
        </div>
        <div class="detail-grid">
          <span>Username</span><strong>{{ data.username }}</strong>
          <span>Email</span><strong>{{ data.email }}</strong>
          <span>Birth Date</span><strong>{{ data.birthDate | date:'dd MMMM yyyy, HH:mm' }}</strong>
          <span>Basic Salary</span><strong>{{ data.basicSalary | currency:'IDR':'Rp. ':'1.2-2':'id-ID' }}</strong>
          <span>Status</span><strong>{{ data.status }}</strong>
          <span>Group</span><strong>{{ data.group }}</strong>
          <span>Description</span><strong>{{ data.description | date:'dd MMMM yyyy, HH:mm' }}</strong>
        </div>
      } @else {
        <h2>Employee tidak ditemukan</h2>
      }
      <div class="detail-actions">
        <button class="primary" type="button" (click)="edit()">Edit Employee</button>
        <button class="ghost" type="button" (click)="ok()">Back</button>
      </div>
    </section>
  `,
})
export class EmployeeDetailComponent {
  readonly id = input.required<string>();
  readonly employee = computed(() => this.employeeService.findById(Number(this.id())));

  readonly initials = computed(() => {
    const data = this.employee();
    if (!data) return '';
    const first = data.firstName ? data.firstName.charAt(0) : '';
    const last = data.lastName ? data.lastName.charAt(0) : '';
    return (first + last).toUpperCase() || data.username.charAt(0).toUpperCase();
  });

  constructor(private readonly employeeService: EmployeeService, private readonly router: Router) {}

  toTitleCase(str: string): string {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  edit(): void {
    const data = this.employee();
    if (data) {
      this.router.navigate(['/employees/edit', data.id]);
    }
  }

  ok(): void { this.router.navigate(['/employees']); }
}

