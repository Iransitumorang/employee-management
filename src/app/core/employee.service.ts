import { Injectable, signal } from '@angular/core';
import { Employee } from './employee.model';

const firstNames = ['Alya', 'Bima', 'Citra', 'Dimas', 'Eka', 'Farhan', 'Gita', 'Hendra', 'Intan', 'Joko'];
const lastNames = ['Pratama', 'Saputra', 'Lestari', 'Wijaya', 'Siregar', 'Nugroho', 'Permata', 'Santoso', 'Maulana', 'Utami'];
const statuses = ['Permanent', 'Contract', 'Probation', 'Inactive'];
export const employeeGroups = ['Engineering', 'Product', 'Design', 'Finance', 'HR', 'Operations', 'Sales', 'Marketing', 'Legal', 'Customer Success'];

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  readonly employees = signal<Employee[]>(this.createEmployees());

  addEmployee(employee: Omit<Employee, 'id'>): void {
    const nextId = Math.max(...this.employees().map((item) => item.id), 0) + 1;
    this.employees.update((items) => [{ id: nextId, ...employee }, ...items]);
  }

  findById(id: number): Employee | undefined {
    return this.employees().find((employee) => employee.id === id);
  }

  private createEmployees(): Employee[] {
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
