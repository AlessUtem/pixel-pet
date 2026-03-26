import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Pet } from '../../core/models/pet.model';

@Component({
  selector: 'app-pet-actions',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="actions-container">
      <h3>🎮 Actions</h3>

      <div class="actions-grid">
        <button
          mat-raised-button
          color="accent"
          (click)="onAction('feed')"
          [disabled]="isLoading || !pet.is_alive"
          matTooltip="Feed your pet (Reduces hunger by 30)"
          class="action-button feed"
        >
          <mat-icon>restaurant</mat-icon>
          <span>Feed</span>
        </button>

        <button
          mat-raised-button
          color="primary"
          (click)="onAction('play')"
          [disabled]="isLoading || !pet.is_alive || pet.energy < 15"
          matTooltip="Play with your pet (Costs 15 energy)"
          class="action-button play"
        >
          <mat-icon>sports_soccer</mat-icon>
          <span>Play</span>
        </button>

        <button
          mat-raised-button
          color="warn"
          (click)="onAction('sleep')"
          [disabled]="isLoading || !pet.is_alive"
          matTooltip="Let your pet sleep (Recovers 30 energy)"
          class="action-button sleep"
        >
          <mat-icon>bed_time</mat-icon>
          <span>Sleep</span>
        </button>

        <button
          mat-raised-button
          (click)="onAction('pet')"
          [disabled]="isLoading || !pet.is_alive"
          matTooltip="Pet your pet (Increases happiness by 10)"
          class="action-button pet"
        >
          <mat-icon>favorite</mat-icon>
          <span>Pet</span>
        </button>
      </div>

      <div *ngIf="errorMessage" class="error-message">
        ⚠️ {{ errorMessage }}
      </div>

      <div *ngIf="successMessage" class="success-message">
        ✅ {{ successMessage }}
      </div>

      <div *ngIf="!pet.is_alive" class="dead-message">
        <p>Your pet has passed away...</p>
        <p class="date">Passed on: {{ pet.death_date | date: 'short' }}</p>
      </div>
    </div>
  `,
  styles: [`
    .actions-container {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 3px solid #00ff00;
      border-radius: 8px;
      padding: 20px;
      color: #00ff00;
      font-family: 'Courier New', monospace;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    }

    h3 {
      margin: 0 0 20px 0;
      text-align: center;
      text-shadow: 0 0 10px #00ff00;
      font-size: 16px;
      text-transform: uppercase;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }

    .action-button {
      width: 100%;
      height: 60px;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: bold;
      border: 2px solid #00ff00 !important;
      color: #1a1a2e !important;
      display: flex;
      flex-direction: column;
      gap: 5px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .action-button:not(:disabled):hover {
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.7);
    }

    .action-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .error-message {
      background: rgba(255, 0, 0, 0.2);
      border: 2px solid #ff0000;
      color: #ff6666;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 10px;
      font-size: 12px;
      text-align: center;
    }

    .success-message {
      background: rgba(0, 255, 0, 0.2);
      border: 2px solid #00ff00;
      color: #66ff66;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 10px;
      font-size: 12px;
      text-align: center;
      animation: fadeOut 3s ease-out forwards;
    }

    .dead-message {
      background: rgba(128, 128, 128, 0.2);
      border: 2px solid #888888;
      color: #cccccc;
      padding: 15px;
      border-radius: 4px;
      text-align: center;
      font-style: italic;
    }

    .dead-message p {
      margin: 5px 0;
      font-size: 12px;
    }

    .date {
      font-size: 10px;
      color: #999999;
    }

    @keyframes fadeOut {
      0% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetActionsComponent {
  @Input() pet!: Pet;
  @Input() isLoading = false;
  @Output() action = new EventEmitter<string>();

  errorMessage = '';
  successMessage = '';

  onAction(actionType: string) {
    // Validaciones
    if (actionType === 'play' && this.pet.energy < 15) {
      this.errorMessage = 'Your pet is too tired to play!';
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }

    if (!this.pet.is_alive) {
      this.errorMessage = 'Your pet has passed away...';
      return;
    }

    this.successMessage = this.getActionMessage(actionType);
    setTimeout(() => (this.successMessage = ''), 2000);

    this.action.emit(actionType);
  }

  private getActionMessage(action: string): string {
    const messages: { [key: string]: string } = {
      feed: '🍗 Your pet is eating...',
      play: '⚽ Your pet is playing...',
      sleep: '😴 Your pet is sleeping...',
      pet: '❤️ Your pet feels loved!',
    };
    return messages[action] || 'Action performed!';
  }
}
