import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>👤 Your Profile</mat-card-title>
        </mat-card-header>

        <mat-card-content *ngIf="authService.userProfile() as profile">
          <div class="profile-header">
            <div class="avatar" *ngIf="profile.avatar_url">
              <img [src]="profile.avatar_url" alt="Avatar" />
            </div>
            <div class="profile-info">
              <h2>{{ profile.display_name }}</h2>
              <p class="email">{{ profile.email }}</p>
              <p class="score">
                <strong>Total Score:</strong> {{ profile.total_score | number }}
              </p>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="profile-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Display Name</mat-label>
              <input
                matInput
                formControlName="display_name"
                placeholder="Your display name"
              />
            </mat-form-field>

            <div class="button-group">
              <button type="button" mat-stroked-button (click)="goBack()" [disabled]="isLoading">
                ← Back
              </button>
              <button
                type="submit"
                mat-raised-button
                color="accent"
                [disabled]="!form.valid || isLoading"
              >
                <mat-spinner *ngIf="isLoading" diameter="20" class="spinner"></mat-spinner>
                <span *ngIf="!isLoading">💾 Save Changes</span>
              </button>
            </div>

            <div *ngIf="errorMessage" class="error-message">
              ⚠️ {{ errorMessage }}
            </div>
            <div *ngIf="successMessage" class="success-message">
              ✅ {{ successMessage }}
            </div>
          </form>
        </mat-card-content>

        <mat-spinner *ngIf="authService.isLoading()" diameter="50"></mat-spinner>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%);
      padding: 40px 20px;
      font-family: 'Courier New', monospace;
    }

    .profile-card {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #00ff00;
      border: 3px solid #00ff00;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    mat-card-title {
      color: #00ff00;
      text-shadow: 0 0 10px #00ff00;
      font-size: 24px;
    }

    .profile-header {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #00ff00;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #00ff00;
      flex-shrink: 0;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .profile-info h2 {
      margin: 0 0 5px 0;
      color: #00ff00;
      text-shadow: 0 0 10px #00ff00;
    }

    .email {
      color: #00cc00;
      font-size: 12px;
      margin: 5px 0;
    }

    .score {
      margin: 10px 0;
      color: #00ff00;
      font-size: 14px;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .full-width {
      width: 100%;
    }

    ::ng-deep .mat-mdc-form-field {
      --mdc-theme-primary: #00ff00 !important;
    }

    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    button {
      flex: 1;
      border: 2px solid #00ff00 !important;
      color: #1a1a2e !important;
      text-transform: uppercase;
      font-weight: bold;
    }

    button:disabled {
      opacity: 0.5;
    }

    .spinner {
      margin-right: 10px;
    }

    .error-message {
      background: rgba(255, 0, 0, 0.2);
      border: 2px solid #ff0000;
      color: #ff6666;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      text-align: center;
    }

    .success-message {
      background: rgba(0, 255, 0, 0.2);
      border: 2px solid #00ff00;
      color: #66ff66;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      text-align: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.group({
    display_name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit() {
    const profile = this.authService.userProfile();
    if (profile) {
      this.form.patchValue({
        display_name: profile.display_name,
      });
    }
  }

  async onSubmit() {
    if (!this.form.valid) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.form.getRawValue();
      await this.authService.updateProfile({
        display_name: formValue.display_name!,
      });

      this.successMessage = 'Profile updated successfully!';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error updating profile';
      this.errorMessage = message;
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}

