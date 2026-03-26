import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>🎮 Pixel Pet</mat-card-title>
          <mat-card-subtitle>Virtual Pet Tamagotchi Game</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <p class="welcome-text">¡Bienvenido a Pixel Pet!</p>
          <p class="description">Crea y cuida tu mascota virtual con gráficos retro 8-bit</p>

          <div class="button-container">
            <button
              mat-raised-button
              color="accent"
              (click)="loginWithGoogle()"
              [disabled]="authService.isLoading()"
              class="google-button"
            >
              <mat-icon *ngIf="!authService.isLoading()">login</mat-icon>
              <mat-spinner
                *ngIf="authService.isLoading()"
                diameter="20"
                class="spinner"
              ></mat-spinner>
              <span>{{ authService.isLoading() ? 'Iniciando sesión...' : 'Sign in with Google' }}</span>
            </button>
          </div>
        </mat-card-content>

        <mat-card-footer>
          <p class="footer-text">No account? Google will create one for you automatically</p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Courier New', monospace;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      background: #1a1a2e;
      color: #00ff00;
      border: 3px solid #00ff00;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
    }

    mat-card-header {
      text-align: center;
      margin-bottom: 20px;
    }

    mat-card-title {
      font-size: 32px;
      text-shadow: 0 0 10px #00ff00;
      margin-bottom: 10px;
    }

    mat-card-subtitle {
      color: #00cc00;
      font-size: 14px;
    }

    .welcome-text {
      font-size: 18px;
      text-align: center;
      margin: 10px 0;
      text-shadow: 0 0 5px #00ff00;
    }

    .description {
      color: #00cc00;
      text-align: center;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .button-container {
      display: flex;
      justify-content: center;
      margin: 30px 0;
    }

    .google-button {
      width: 100%;
      padding: 12px;
      background-color: #4285f4;
      color: white;
      border: 2px solid #00ff00;
      text-transform: none;
      font-size: 16px;
      font-family: 'Courier New', monospace;
      transition: all 0.3s ease;
    }

    .google-button:hover:not(:disabled) {
      background-color: #357ae8;
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.7);
      transform: scale(1.05);
    }

    .google-button:disabled {
      opacity: 0.7;
    }

    .spinner {
      margin-right: 10px;
    }

    mat-card-footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #00ff00;
    }

    .footer-text {
      color: #00cc00;
      font-size: 12px;
      margin: 0;
    }
  `],
  changeDetection: require('@angular/core').ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      // Supabase redirige automáticamente al dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  }
}

