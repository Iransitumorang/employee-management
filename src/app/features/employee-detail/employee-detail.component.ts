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
        <h2>{{ data.firstName }} {{ data.lastName }}</h2>
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
      <button class="primary" type="button" (click)="ok()">OK</button>
    </section>
  `,
})
export class EmployeeDetailComponent {
  readonly id = input.required<string>();
  readonly employee = computed(() => this.employeeService.findById(Number(this.id())));

  constructor(private readonly employeeService: EmployeeService, private readonly router: Router) {}

  ok(): void { this.router.navigate(['/employees']); }
}
