import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'employees' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'employees',
        loadComponent: () => import('./features/employees-list/employees-list.component').then((m) => m.EmployeesListComponent),
      },
      {
        path: 'employees/add',
        loadComponent: () => import('./features/employee-form/employee-form.component').then((m) => m.EmployeeFormComponent),
      },
      {
        path: 'employees/:id',
        loadComponent: () => import('./features/employee-detail/employee-detail.component').then((m) => m.EmployeeDetailComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'employees' },
];
