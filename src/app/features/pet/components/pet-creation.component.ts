import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { PetService } from '../../core/services/pet.service';

const SPECIES = [
  { name: 'Cat', value: 'cat', emoji: '🐱' },
  { name: 'Dog', value: 'dog', emoji: '🐕' },
  { name: 'Dragon', value: 'dragon', emoji: '🐉' },
  { name: 'Generic', value: 'generic', emoji: '⭕' },
];

@Component({
  selector: 'app-pet-creation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="creation-container">
      <mat-card class="creation-card">
        <mat-card-header>
          <mat-card-title>✨ Create Your Pet</mat-card-title>
          <mat-card-subtitle>Give birth to a new virtual friend</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Pet Name</mat-label>
              <input matInput formControlName="name" placeholder="Choose a name" />
              <mat-error *ngIf="form.get('name')?.hasError('required')">
                Name is required
              </mat-error>
              <mat-error *ngIf="form.get('name')?.hasError('minlength')">
                Name must be at least 2 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Species</mat-label>
              <mat-select formControlName="species">
                <mat-option *ngFor="let sp of species" [value]="sp.value">
                  {{ sp.emoji }} {{ sp.name }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('species')?.hasError('required')">
                Species is required
              </mat-error>
            </mat-form-field>

            <div class="preview">
              <p>Your pet will start as an 🥚 Egg</p>
              <p class="info">It will evolve to: Baby → Teen → Adult</p>
            </div>

            <div class="button-group">
              <button
                type="button"
                mat-stroked-button
                (click)="goBack()"
                [disabled]="isLoading"
              >
                ← Back
              </button>
              <button
                type="submit"
                mat-raised-button
                color="accent"
                [disabled]="!form.valid || isLoading"
              >
                <mat-spinner *ngIf="isLoading" diameter="20" class="spinner"></mat-spinner>
                <span *ngIf="!isLoading">✨ Create Pet</span>
              </button>
            </div>

            <div *ngIf="errorMessage" class="error-message">
              ⚠️ {{ errorMessage }}
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .creation-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%);
      padding: 20px;
      font-family: 'Courier New', monospace;
    }

    .creation-card {
      width: 100%;
      max-width: 400px;
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

    mat-card-subtitle {
      color: #00cc00;
      font-size: 12px;
    }

    form {
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

    ::ng-deep .mdc-text-field--outlined {
      border-color: #00ff00 !important;
    }

    .preview {
      background: rgba(0, 255, 0, 0.1);
      border: 2px solid #00ff00;
      padding: 15px;
      border-radius: 4px;
      text-align: center;
      color: #00ff00;
    }

    .preview p {
      margin: 5px 0;
      font-size: 12px;
    }

    .preview .info {
      color: #00cc00;
      font-size: 10px;
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetCreationComponent {
  private fb = inject(FormBuilder);
  private petService = inject(PetService);
  private router = inject(Router);

  species = SPECIES;
  isLoading = false;
  errorMessage = '';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    species: ['generic', Validators.required],
  });

  async onSubmit() {
    if (!this.form.valid) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.form.getRawValue();
      const newPet = await this.petService.createPet({
        name: formValue.name!,
        species: formValue.species!,
      });

      if (newPet) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Failed to create pet. Please try again.';
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error creating pet';
      this.errorMessage = message;
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}

