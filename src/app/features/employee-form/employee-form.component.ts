import { Component, computed, inject, input, effect, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService, employeeGroups } from '../../core/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="card form-page">
      <p class="eyebrow">{{ id() ? 'Edit Employee' : 'Add Employee' }}</p>
      <h2>{{ id() ? 'Edit Data Employee' : 'Tambah Employee' }}</h2>
      <p class="muted">Semua field mandatory. Birth date tidak boleh lebih dari hari ini.</p>

      <form [formGroup]="form" (ngSubmit)="save()" class="employee-form">
        <label>Username <input formControlName="username" /></label>
        <label>First Name <input formControlName="firstName" /></label>
        <label>Last Name <input formControlName="lastName" /></label>
        <label>Email <input formControlName="email" type="email" /></label>
        <label>Birth Date <input formControlName="birthDate" type="datetime-local" [max]="maxDateTime" /></label>
        <label>Basic Salary <input formControlName="basicSalary" type="number" min="0" /></label>
        <label>Status
          <select formControlName="status">
            <option value="">Choose status</option>
            <option>Permanent</option><option>Contract</option><option>Probation</option><option>Inactive</option>
          </select>
        </label>

        <div class="combo-box">
          <label>Group Search <input [value]="groupSearch()" (input)="groupSearch.set($any($event.target).value)" placeholder="Search group..." /></label>
          <label>Group
            <select formControlName="group">
              <option value="">Choose group</option>
              @for (group of filteredGroups(); track group) { <option [value]="group">{{ group }}</option> }
            </select>
          </label>
        </div>

        <label class="wide">Description <input formControlName="description" type="datetime-local" /></label>

        @if (submitted() && form.invalid) {
          <div class="alert danger wide">Masih ada data kosong atau format tidak valid. Jangan ngegas submit dulu, cuy.</div>
        }

        <div class="button-row wide">
          <button class="ghost" type="button" (click)="cancel()">Cancel</button>
          <button class="primary" type="submit">Save</button>
        </div>
      </form>
    </section>
  `,
})
export class EmployeeFormComponent {
  private readonly fb = inject(FormBuilder);
  readonly id = input<string>();
  readonly groups = employeeGroups;
  readonly groupSearch = signal('');
  readonly submitted = signal(false);
  readonly maxDateTime = new Date().toISOString().slice(0, 16);
  readonly filteredGroups = computed(() => this.groups.filter((group) => group.toLowerCase().includes(this.groupSearch().toLowerCase())));

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    birthDate: ['', [Validators.required, this.notFutureDateValidator]],
    basicSalary: [0, [Validators.required, Validators.min(1)]],
    status: ['', Validators.required],
    group: ['', Validators.required],
    description: ['', Validators.required],
  });

  constructor(private readonly employeeService: EmployeeService, private readonly router: Router) {
    effect(() => {
      const empId = this.id();
      if (empId) {
        const employee = this.employeeService.findById(Number(empId));
        if (employee) {
          this.form.patchValue({
            username: employee.username,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            birthDate: employee.birthDate,
            basicSalary: employee.basicSalary,
            status: employee.status,
            group: employee.group,
            description: employee.description,
          });
        }
      }
    });
  }

  save(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const empId = this.id();
    const rawValue = this.form.getRawValue();
    if (empId) {
      this.employeeService.updateEmployee(Number(empId), rawValue);
      sessionStorage.setItem('employee.toast', JSON.stringify({ type: 'edit', message: `Employee ${rawValue.username} berhasil di-update.` }));
    } else {
      this.employeeService.addEmployee(rawValue);
      sessionStorage.setItem('employee.toast', JSON.stringify({ type: 'add', message: `Employee ${rawValue.username} berhasil ditambahkan.` }));
    }
    this.router.navigate(['/employees']);
  }

  cancel(): void { this.router.navigate(['/employees']); }

  private notFutureDateValidator(control: { value: string }): { futureDate: true } | null {
    return control.value && new Date(control.value) > new Date() ? { futureDate: true } : null;
  }
}
