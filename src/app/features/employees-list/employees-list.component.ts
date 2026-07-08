import { CommonModule } from '@angular/common';
import { Component, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
        <p class="muted">Filter menggunakan rule AND: keyword + status + group.</p>
      </div>
      <a class="primary" routerLink="/employees/add">+ Add Employee</a>
    </section>

    @if (toast()) {
      <div class="toast" [class.warn]="toast()?.type === 'edit'" [class.danger]="toast()?.type === 'delete'">
        {{ toast()?.message }}
      </div>
    }

    <section class="card">
      <div class="filters">
        <label>Search username / name / email
          <div class="input-with-btn">
            <div class="search-input-wrapper">
              <input [value]="keywordInput()" (input)="onKeywordInput($any($event.target).value)" placeholder="Cari employee..." />
              @if (keywordInput()) {
                <button class="btn-clear-input" type="button" (click)="clearKeywordInput()">✕</button>
              }
            </div>
            <button class="btn-search" type="button" (click)="applySearch()">🔍 Search</button>
          </div>
        </label>
        <label>Status
          <select [value]="status()" (change)="onStatusChange($any($event.target).value)">
            <option value="">All Status</option>
            <option>Permanent</option><option>Contract</option><option>Probation</option><option>Inactive</option>
          </select>
        </label>
        <label>Group
          <select [value]="group()" (change)="onGroupChange($any($event.target).value)">
            <option value="">All Group</option>
            @for (item of groups; track item) { <option>{{ item }}</option> }
          </select>
        </label>
        <label>Rows per page
          <select [value]="pageSize()" (change)="onPageSizeChange(+$any($event.target).value)">
            <option [value]="5">5</option><option [value]="10">10</option><option [value]="25">25</option><option [value]="50">50</option>
          </select>
        </label>
      </div>
      <div class="filter-info">
        <span class="result-count">{{ filteredEmployees().length }} data ditemukan</span>
        @if (hasActiveFilter()) {
          <button class="btn-clear" type="button" (click)="resetFilters()">✕ Hapus Filter</button>
        }
      </div>
    </section>

    <section class="card table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th (click)="sortBy('username')">Username {{ sortIcon('username') }}</th>
              <th (click)="sortBy('firstName')">Name {{ sortIcon('firstName') }}</th>
              <th (click)="sortBy('email')">Email {{ sortIcon('email') }}</th>
              <th (click)="sortBy('basicSalary')">Salary {{ sortIcon('basicSalary') }}</th>
              <th (click)="sortBy('status')">Status {{ sortIcon('status') }}</th>
              <th (click)="sortBy('group')">Group {{ sortIcon('group') }}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            @for (employee of pagedEmployees(); track employee.id; let i = $index) {
              <tr class="clickable-row" (dblclick)="goDetail(employee.id)" title="Klik 2x untuk melihat detail data">
                <td>{{ (page() - 1) * pageSize() + i + 1 }}</td>
                <td>
                  <button class="link" type="button" (click)="goDetail(employee.id)">
                    <span [innerHTML]="getHighlightedText(employee.username)"></span>
                  </button>
                </td>
                <td>
                  <span [innerHTML]="getHighlightedText(toTitleCase(employee.firstName + ' ' + employee.lastName))"></span>
                </td>
                <td>
                  <span [innerHTML]="getHighlightedText(employee.email)"></span>
                </td>
                <td>{{ employee.basicSalary | currency:'IDR':'Rp. ':'1.2-2':'id-ID' }}</td>
                <td><span class="badge" [ngClass]="employee.status.toLowerCase()">{{ employee.status }}</span></td>
                <td>{{ employee.group }}</td>
                <td class="actions" (dblclick)="$event.stopPropagation()">
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
        <div class="pagination-controls">
          <button class="ghost" type="button" [disabled]="page() === 1" (click)="page.set(page() - 1)">Prev</button>
          <div class="page-numbers">
            @for (p of pageNumbers(); track p) {
              <button class="page-num" [class.active]="p === page()" type="button" (click)="page.set(p)">{{ p }}</button>
            }
          </div>
          <button class="ghost" type="button" [disabled]="page() === totalPages()" (click)="page.set(page() + 1)">Next</button>
        </div>
      </footer>
    </section>
  `,
})
export class EmployeesListComponent {
  readonly groups = employeeGroups;

  // Semua filter pakai signal agar computed() bisa reaktif
  readonly keyword = signal(sessionStorage.getItem('employee.keyword') ?? '');
  readonly status = signal(sessionStorage.getItem('employee.status') ?? '');
  readonly group = signal(sessionStorage.getItem('employee.group') ?? '');
  readonly pageSize = signal(Number(sessionStorage.getItem('employee.pageSize') ?? 10));
  readonly page = signal(Number(sessionStorage.getItem('employee.page') ?? 1));
  readonly sortKey = signal<SortKey>('username');
  readonly sortDirection = signal<SortDirection>('asc');
  readonly toast = signal<{ type: 'edit' | 'delete'; message: string } | null>(null);

  // Input sementara sebelum tombol Search ditekan
  readonly keywordInput = signal(sessionStorage.getItem('employee.keyword') ?? '');

  readonly filteredEmployees = computed(() => {
    const keyword = this.keyword().toLowerCase().trim();
    return this.employeeService.employees()
      .filter((employee) => !keyword || [employee.username, employee.firstName, employee.lastName, employee.email].some((value) => value.toLowerCase().includes(keyword)))
      .filter((employee) => !this.status() || employee.status === this.status())
      .filter((employee) => !this.group() || employee.group === this.group())
      .sort((a, b) => this.compare(a, b));
  });

  readonly hasActiveFilter = computed(() => !!this.keyword() || !!this.status() || !!this.group());
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredEmployees().length / this.pageSize())));
  readonly pagedEmployees = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredEmployees().slice(start, start + this.pageSize());
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const pages: number[] = [];
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    for (let i = start; i <= end; i++) {
      if (i >= 1 && i <= total) {
        pages.push(i);
      }
    }
    return pages;
  });

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer
  ) {
    const savedToast = sessionStorage.getItem('employee.toast');
    if (savedToast) {
      try {
        const parsed = JSON.parse(savedToast);
        this.showToast(parsed.type, parsed.message);
      } catch {}
      sessionStorage.removeItem('employee.toast');
    }
  }

  onKeywordInput(value: string): void {
    this.keywordInput.set(value);
    // Instant search/real-time update
    this.keyword.set(value);
    this.resetPage();
  }

  clearKeywordInput(): void {
    this.keywordInput.set('');
    this.keyword.set('');
    this.resetPage();
  }

  getHighlightedText(text: string): SafeHtml {
    const search = this.keyword().toLowerCase().trim();
    if (!search) return this.sanitizer.bypassSecurityTrustHtml(text);
    
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearch})`, 'gi');
    const highlighted = text.replace(regex, `<mark class="search-highlight">$1</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  toTitleCase(str: string): string {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  onStatusChange(value: string): void { this.status.set(value); this.resetPage(); }
  onGroupChange(value: string): void { this.group.set(value); this.resetPage(); }
  onPageSizeChange(value: number): void { this.pageSize.set(value); this.resetPage(); }

  applySearch(): void {
    this.keyword.set(this.keywordInput());
    this.resetPage();
  }

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    else { this.sortKey.set(key); this.sortDirection.set('asc'); }
  }

  sortIcon(key: SortKey): string {
    if (this.sortKey() !== key) return '↕';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  resetPage(): void { this.page.set(1); this.saveSearchState(); }

  resetFilters(): void {
    this.keyword.set('');
    this.keywordInput.set('');
    this.status.set('');
    this.group.set('');
    this.pageSize.set(10);
    this.page.set(1);
    this.saveSearchState();
  }

  goDetail(id: number): void { this.saveSearchState(); this.router.navigate(['/employees', id]); }

  showEdit(employee: Employee): void {
    this.saveSearchState();
    this.router.navigate(['/employees/edit', employee.id]);
  }

  showDelete(employee: Employee): void {
    this.employeeService.deleteEmployee(employee.id);
    this.showToast('delete', `Employee ${employee.username} berhasil dihapus.`);
  }

  private showToast(type: 'edit' | 'delete', message: string): void {
    this.toast.set({ type, message });
    setTimeout(() => this.toast.set(null), 3000);
  }

  private saveSearchState(): void {
    sessionStorage.setItem('employee.keyword', this.keyword());
    sessionStorage.setItem('employee.status', this.status());
    sessionStorage.setItem('employee.group', this.group());
    sessionStorage.setItem('employee.pageSize', String(this.pageSize()));
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
