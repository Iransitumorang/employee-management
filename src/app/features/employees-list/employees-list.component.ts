import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Employee } from '../../core/employee.model';
import { EmployeeService, employeeGroups } from '../../core/employee.service';

type SortKey = keyof Pick<Employee, 'username' | 'firstName' | 'email' | 'basicSalary' | 'status' | 'group'>;
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="toolbar card">
      <div>
        <p class="eyebrow">Employee List</p>
        <h2>Data Employee</h2>
        <p class="muted">Search memakai rule AND: keyword + status + group.</p>
      </div>
      <a class="primary" routerLink="/employees/add">+ Add Employee</a>
    </section>

    @if (toast()) {
      <div class="toast" [class.warn]="toast()?.type === 'edit'" [class.danger]="toast()?.type === 'delete'">
        {{ toast()?.message }}
      </div>
    }

    <section class="card filters">
      <label>Search username / name / email
        <input [(ngModel)]="keyword" (ngModelChange)="resetPage()" placeholder="Cari employee..." />
      </label>
      <label>Status
        <select [(ngModel)]="status" (ngModelChange)="resetPage()">
          <option value="">All Status</option>
          <option>Permanent</option><option>Contract</option><option>Probation</option><option>Inactive</option>
        </select>
      </label>
      <label>Group
        <select [(ngModel)]="group" (ngModelChange)="resetPage()">
          <option value="">All Group</option>
          @for (item of groups; track item) { <option>{{ item }}</option> }
        </select>
      </label>
      <label>Rows per page
        <select [(ngModel)]="pageSize" (ngModelChange)="resetPage()">
          <option [ngValue]="5">5</option><option [ngValue]="10">10</option><option [ngValue]="25">25</option><option [ngValue]="50">50</option>
        </select>
      </label>
    </section>

    <section class="card table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th (click)="sortBy('username')">Username</th>
              <th (click)="sortBy('firstName')">Name</th>
              <th (click)="sortBy('email')">Email</th>
              <th (click)="sortBy('basicSalary')">Salary</th>
              <th (click)="sortBy('status')">Status</th>
              <th (click)="sortBy('group')">Group</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            @for (employee of pagedEmployees(); track employee.id; let i = $index) {
              <tr>
                <td>{{ (page() - 1) * pageSize + i + 1 }}</td>
                <td><button class="link" type="button" (click)="goDetail(employee.id)">{{ employee.username }}</button></td>
                <td>{{ employee.firstName }} {{ employee.lastName }}</td>
                <td>{{ employee.email }}</td>
                <td>{{ employee.basicSalary | currency:'IDR':'Rp. ':'1.2-2':'id-ID' }}</td>
                <td><span class="badge">{{ employee.status }}</span></td>
                <td>{{ employee.group }}</td>
                <td class="actions">
                  <button class="mini edit" type="button" (click)="showEdit(employee)">Edit</button>
                  <button class="mini delete" type="button" (click)="showDelete(employee)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="empty">Data tidak ditemukan.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <footer class="pagination">
        <span>Total: {{ filteredEmployees().length }} data</span>
        <div>
          <button class="ghost" type="button" [disabled]="page() === 1" (click)="page.set(page() - 1)">Prev</button>
          <strong>Page {{ page() }} / {{ totalPages() }}</strong>
          <button class="ghost" type="button" [disabled]="page() === totalPages()" (click)="page.set(page() + 1)">Next</button>
        </div>
      </footer>
    </section>
  `,
})
export class EmployeesListComponent {
  readonly groups = employeeGroups;
  keyword = sessionStorage.getItem('employee.keyword') ?? '';
  status = sessionStorage.getItem('employee.status') ?? '';
  group = sessionStorage.getItem('employee.group') ?? '';
  pageSize = Number(sessionStorage.getItem('employee.pageSize') ?? 10);
  readonly page = signal(Number(sessionStorage.getItem('employee.page') ?? 1));
  readonly sortKey = signal<SortKey>('username');
  readonly sortDirection = signal<SortDirection>('asc');
  readonly toast = signal<{ type: 'edit' | 'delete'; message: string } | null>(null);

  readonly filteredEmployees = computed(() => {
    const keyword = this.keyword.toLowerCase().trim();
    return this.employeeService.employees()
      .filter((employee) => !keyword || [employee.username, employee.firstName, employee.lastName, employee.email].some((value) => value.toLowerCase().includes(keyword)))
      .filter((employee) => !this.status || employee.status === this.status)
      .filter((employee) => !this.group || employee.group === this.group)
      .sort((a, b) => this.compare(a, b));
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredEmployees().length / this.pageSize)));
  readonly pagedEmployees = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredEmployees().slice(start, start + this.pageSize);
  });

  constructor(private readonly employeeService: EmployeeService, private readonly router: Router) {}

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    else { this.sortKey.set(key); this.sortDirection.set('asc'); }
  }

  resetPage(): void { this.page.set(1); this.saveSearchState(); }

  goDetail(id: number): void { this.saveSearchState(); this.router.navigate(['/employees', id]); }

  showEdit(employee: Employee): void { this.showToast('edit', `Edit dummy untuk ${employee.username}`); }
  showDelete(employee: Employee): void { this.showToast('delete', `Delete dummy untuk ${employee.username}`); }

  private showToast(type: 'edit' | 'delete', message: string): void {
    this.toast.set({ type, message });
    setTimeout(() => this.toast.set(null), 2500);
  }

  private saveSearchState(): void {
    sessionStorage.setItem('employee.keyword', this.keyword);
    sessionStorage.setItem('employee.status', this.status);
    sessionStorage.setItem('employee.group', this.group);
    sessionStorage.setItem('employee.pageSize', String(this.pageSize));
    sessionStorage.setItem('employee.page', String(this.page()));
  }

  private compare(a: Employee, b: Employee): number {
    const key = this.sortKey();
    const left = a[key];
    const right = b[key];
    const result = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right));
    return this.sortDirection() === 'asc' ? result : -result;
  }
}
