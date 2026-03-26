import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { PetService } from '../../core/services/pet.service';
import { PetStatsService } from '../../core/services/pet-stats.service';
import { AuthService } from '../../core/services/auth.service';
import { PetDisplayComponent } from '../components/pet-display.component';
import { StatsDisplayComponent } from '../components/stats-display.component';
import { PetActionsComponent } from '../components/pet-actions.component';
import { Pet } from '../../core/models/pet.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    PetDisplayComponent,
    StatsDisplayComponent,
    PetActionsComponent,
  ],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>🎮 Pixel Pet</h1>
        <div class="header-actions">
          <button mat-button (click)="goToProfile()">👤 Profile</button>
          <button mat-button (click)="goToLeaderboard()">🏆 Leaderboard</button>
          <button mat-button (click)="logout()" color="warn">Logout</button>
        </div>
      </header>

      <div class="dashboard-container">
        <!-- Sin mascota aún -->
        <div *ngIf="!petService.currentPet() && !petService.isLoading()" class="no-pet">
          <mat-card>
            <mat-card-header>
              <mat-card-title>No Pet Yet</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Create your first virtual pet to get started!</p>
              <button mat-raised-button color="accent" (click)="goToCreatePet()">
                ✨ Create Pet
              </button>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Cargando -->
        <mat-spinner *ngIf="petService.isLoading()" diameter="50"></mat-spinner>

        <!-- Mascota actual -->
        <ng-container *ngIf="petService.currentPet() as pet">
          <div class="pet-main">
            <app-pet-display [pet]="pet"></app-pet-display>
            <app-stats-display [pet]="pet"></app-stats-display>
            <app-pet-actions
              [pet]="pet"
              [isLoading]="petService.isLoading()"
              (action)="handlePetAction($event, pet)"
            ></app-pet-actions>
          </div>
        </ng-container>

        <!-- Otras mascotas -->
        <div *ngIf="(petService.userPets() | slice: 1).length > 0" class="other-pets">
          <h3>Your Other Pets</h3>
          <div class="pets-list">
            <mat-card
              *ngFor="let otherPet of (petService.userPets() | slice: 1)"
              class="pet-card"
              (click)="selectPet(otherPet)"
            >
              <mat-card-header>
                <mat-card-title>{{ otherPet.name }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>{{ formatSpecies(otherPet.species) }} • {{ formatStage(otherPet.stage) }}</p>
                <p *ngIf="!otherPet.is_alive" class="dead">💀 Deceased</p>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%);
      color: #00ff00;
      font-family: 'Courier New', monospace;
      padding: 20px;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding: 20px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 3px solid #00ff00;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    }

    h1 {
      margin: 0;
      text-shadow: 0 0 10px #00ff00;
      font-size: 32px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .header-actions button {
      color: #00ff00 !important;
      border: 1px solid #00ff00 !important;
      text-transform: uppercase;
      font-size: 12px;
      font-weight: bold;
    }

    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .no-pet {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .no-pet mat-card {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 3px solid #00ff00;
      color: #00ff00;
      text-align: center;
    }

    .no-pet button {
      margin-top: 20px;
    }

    .pet-main {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 40px;
    }

    @media (max-width: 1024px) {
      .pet-main {
        grid-template-columns: 1fr;
      }
    }

    .other-pets {
      margin-top: 40px;
    }

    .other-pets h3 {
      color: #00ff00;
      text-shadow: 0 0 10px #00ff00;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .pets-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
    }

    .pet-card {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 2px solid #00ff00;
      color: #00ff00;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .pet-card:hover {
      border-color: #00cc00;
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
      transform: scale(1.05);
    }

    .pet-card p {
      font-size: 12px;
      margin: 5px 0;
    }

    .pet-card .dead {
      color: #888888;
    }

    mat-spinner {
      margin: 40px auto;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  petService = inject(PetService);
  petStatsService = inject(PetStatsService);
  authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    // Cargar mascotas del usuario
    await this.petService.getUserPets();

    // Si hay mascotas, seleccionar la primera
    const pets = this.petService.userPets();
    if (pets.length > 0) {
      this.petService.currentPet.set(pets[0]);
    }
  }

  async handlePetAction(action: string, pet: Pet) {
    try {
      switch (action) {
        case 'feed':
          await this.petStatsService.feedPet(pet.id, pet);
          break;
        case 'play':
          await this.petStatsService.playWithPet(pet.id, pet);
          break;
        case 'sleep':
          await this.petStatsService.sleepPet(pet.id, pet);
          break;
        case 'pet':
          await this.petStatsService.petThePet(pet.id, pet);
          break;
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
  }

  selectPet(pet: Pet) {
    this.petService.currentPet.set(pet);
  }

  formatSpecies(species: string): string {
    return species.charAt(0).toUpperCase() + species.slice(1);
  }

  formatStage(stage: string): string {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  }

  goToCreatePet() {
    this.router.navigate(['/pets/create']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToLeaderboard() {
    this.router.navigate(['/leaderboard']);
  }

  async logout() {
    await this.authService.logout();
  }
}

