import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { PetService } from '../../core/services/pet.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="leaderboard-container">
      <mat-card class="leaderboard-card">
        <mat-card-header>
          <mat-card-title>🏆 Leaderboard</mat-card-title>
          <mat-card-subtitle>Top Players</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-spinner *ngIf="isLoading()" diameter="50"></mat-spinner>

          <div *ngIf="!isLoading()" class="leaderboard-table">
            <div class="table-header">
              <div class="rank-col">Rank</div>
              <div class="name-col">Player</div>
              <div class="score-col">Score</div>
              <div class="pets-col">Pets</div>
              <div class="health-col">Avg Health</div>
            </div>

            <div
              *ngFor="let entry of leaderboard(); let i = index"
              class="table-row"
              [class.highlight]="isCurrentUser(entry.id)"
            >
              <div class="rank-col">
                <span class="medal" *ngIf="i < 3">{{ getMedalEmoji(i) }}</span>
                <span *ngIf="i >= 3">#{{ i + 1 }}</span>
              </div>
              <div class="name-col">
                <div class="player-info">
                  <img *ngIf="entry.avatar_url" [src]="entry.avatar_url" alt="Avatar" />
                  <span>{{ entry.display_name }}</span>
                </div>
              </div>
              <div class="score-col">{{ entry.total_score | number }}</div>
              <div class="pets-col">{{ entry.pets_count }}</div>
              <div class="health-col">{{ entry.avg_pet_health | number: '1.0-0' }}%</div>
            </div>

            <div *ngIf="leaderboard().length === 0" class="no-data">
              No players yet. Be the first!
            </div>
          </div>
        </mat-card-content>

        <mat-card-footer>
          <button mat-stroked-button (click)="goBack()" class="back-button">
            ← Back
          </button>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .leaderboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%);
      padding: 40px 20px;
      font-family: 'Courier New', monospace;
    }

    .leaderboard-card {
      max-width: 900px;
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
      font-size: 28px;
    }

    mat-card-subtitle {
      color: #00cc00;
      font-size: 12px;
    }

    .leaderboard-table {
      display: flex;
      flex-direction: column;
      gap: 0;
      border: 2px solid #00ff00;
      border-radius: 4px;
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 50px 1fr 100px 80px 100px;
      gap: 10px;
      padding: 15px;
      background: rgba(0, 255, 0, 0.2);
      border-bottom: 2px solid #00ff00;
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
    }

    .table-row {
      display: grid;
      grid-template-columns: 50px 1fr 100px 80px 100px;
      gap: 10px;
      padding: 12px 15px;
      border-bottom: 1px solid #00cc00;
      align-items: center;
      font-size: 12px;
      transition: all 0.3s ease;
    }

    .table-row:hover {
      background: rgba(0, 255, 0, 0.1);
    }

    .table-row.highlight {
      background: rgba(0, 255, 0, 0.2);
      border-left: 3px solid #00ff00;
      padding-left: 12px;
    }

    .rank-col {
      text-align: center;
      font-weight: bold;
    }

    .medal {
      font-size: 18px;
    }

    .name-col {
      display: flex;
      align-items: center;
    }

    .player-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .player-info img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid #00ff00;
    }

    .score-col,
    .pets-col,
    .health-col {
      text-align: right;
      font-weight: bold;
    }

    .no-data {
      padding: 40px;
      text-align: center;
      color: #00cc00;
      font-style: italic;
    }

    mat-card-footer {
      padding: 20px;
      border-top: 2px solid #00ff00;
    }

    .back-button {
      border: 2px solid #00ff00 !important;
      color: #00ff00 !important;
      text-transform: uppercase;
      font-weight: bold;
    }

    mat-spinner {
      margin: 40px auto;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeaderboardComponent implements OnInit {
  private petService = inject(PetService);
  private router = inject(Router);

  leaderboard = signal<any[]>([]);
  isLoading = signal(false);

  async ngOnInit() {
    await this.loadLeaderboard();
  }

  private async loadLeaderboard() {
    try {
      this.isLoading.set(true);
      const data = await this.petService.getLeaderboard(50);
      this.leaderboard.set(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getMedalEmoji(index: number): string {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return '';
    }
  }

  isCurrentUser(userId: string): boolean {
    // Aquí iría la comparación con el usuario actual
    // Por ahora retornamos false
    return false;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}

