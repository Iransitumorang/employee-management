import { Injectable, signal } from '@angular/core';
import { Employee } from './employee.model';

const firstNames = ['Alya', 'Bima', 'Citra', 'Dimas', 'Eka', 'Farhan', 'Gita', 'Hendra', 'Intan', 'Joko'];
const lastNames = ['Pratama', 'Saputra', 'Lestari', 'Wijaya', 'Siregar', 'Nugroho', 'Permata', 'Santoso', 'Maulana', 'Utami'];
const statuses = ['Permanent', 'Contract', 'Probation', 'Inactive'];
export const employeeGroups = ['Engineering', 'Product', 'Design', 'Finance', 'HR', 'Operations', 'Sales', 'Marketing', 'Legal', 'Customer Success'];

const STORAGE_KEY = 'employee_management_data';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  readonly employees = signal<Employee[]>(this.loadEmployees());

  addEmployee(employee: Omit<Employee, 'id'>): void {
    const nextId = Math.max(...this.employees().map((item) => item.id), 0) + 1;
    this.employees.update((items) => {
      const updated = [{ id: nextId, ...employee }, ...items];
      this.saveToStorage(updated);
      return updated;
    });
  }

  findById(id: number): Employee | undefined {
    return this.employees().find((employee) => employee.id === id);
  }

  updateEmployee(id: number, employee: Omit<Employee, 'id'>): void {
    this.employees.update((items) => {
      const updated = items.map((item) => item.id === id ? { id, ...employee } : item);
      this.saveToStorage(updated);
      return updated;
    });
  }

  deleteEmployee(id: number): void {
    this.employees.update((items) => {
      const updated = items.filter((item) => item.id !== id);
      this.saveToStorage(updated);
      return updated;
    });
  }

  private loadEmployees(): Employee[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as Employee[];
    } catch {}
    const seed = this.seedEmployees();
    this.saveToStorage(seed);
    return seed;
  }

  private saveToStorage(employees: Employee[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch {}
  }

  private seedEmployees(): Employee[] {
    return Array.from({ length: 120 }, (_, index) => {
      const number = index + 1;
      const firstName = firstNames[index % firstNames.length];
      const lastName = lastNames[index % lastNames.length];
      const birthYear = 1985 + (index % 18);
      const birthMonth = String((index % 12) + 1).padStart(2, '0');
      const birthDay = String((index % 28) + 1).padStart(2, '0');
      return {
        id: number,
        username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${number}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${number}@company.test`,
        birthDate: `${birthYear}-${birthMonth}-${birthDay}T09:00`,
        basicSalary: 5_000_000 + index * 175_000,
        status: statuses[index % statuses.length],
        group: employeeGroups[index % employeeGroups.length],
        description: `2026-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 28) + 1).padStart(2, '0')}T10:30`,
      } satisfies Employee;
    });
  }
}
