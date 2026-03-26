import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'pet',
    canActivate: [authGuard],
    loadComponent: () => import('./features/pet/pages/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'pet-create',
    canActivate: [authGuard],
    loadComponent: () => import('./features/pet/components/pet-creation.component').then(m => m.PetCreationComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
  },
  {
    path: '',
    redirectTo: '/pet',
    pathMatch: 'full'
  }
];
