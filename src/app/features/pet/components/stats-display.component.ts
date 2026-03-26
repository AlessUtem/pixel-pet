import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Pet } from '../../core/models/pet.model';

@Component({
  selector: 'app-stats-display',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  template: `
    <div class="stats-container">
      <h3>📊 Stats</h3>

      <div class="stat">
        <label>🍗 Hunger</label>
        <mat-progress-bar
          mode="determinate"
          [value]="pet.hunger"
          [ngClass]="'hunger-' + getSeverity(pet.hunger)"
        ></mat-progress-bar>
        <span class="value">{{ pet.hunger | number: '1.0-0' }}/100</span>
      </div>

      <div class="stat">
        <label>⚡ Energy</label>
        <mat-progress-bar
          mode="determinate"
          [value]="pet.energy"
          [ngClass]="'energy-' + getSeverity(100 - pet.energy)"
        ></mat-progress-bar>
        <span class="value">{{ pet.energy | number: '1.0-0' }}/100</span>
      </div>

      <div class="stat">
        <label>😊 Happiness</label>
        <mat-progress-bar
          mode="determinate"
          [value]="pet.happiness"
          [ngClass]="'happiness-' + getSeverity(100 - pet.happiness)"
        ></mat-progress-bar>
        <span class="value">{{ pet.happiness | number: '1.0-0' }}/100</span>
      </div>

      <div class="stat">
        <label>❤️ Health</label>
        <mat-progress-bar
          mode="determinate"
          [value]="pet.health"
          [ngClass]="'health-' + getSeverity(100 - pet.health)"
        ></mat-progress-bar>
        <span class="value">{{ pet.health | number: '1.0-0' }}/100</span>
      </div>

      <div class="extra-stats">
        <div class="extra-stat">
          <span>✨ Experience</span>
          <span class="value">{{ pet.experience }}</span>
        </div>
        <div class="extra-stat">
          <span>🎮 Actions</span>
          <span class="value">{{ pet.total_actions }}</span>
        </div>
        <div class="extra-stat">
          <span>📅 Age</span>
          <span class="value">{{ getAgeDisplay() }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
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

    .stat {
      margin-bottom: 15px;
      display: grid;
      grid-template-columns: 100px 1fr 60px;
      gap: 10px;
      align-items: center;
    }

    label {
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
    }

    ::ng-deep .mat-progress-bar {
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }

    ::ng-deep .hunger-low .mdc-linear-progress__bar-inner,
    ::ng-deep .energy-low .mdc-linear-progress__bar-inner,
    ::ng-deep .happiness-low .mdc-linear-progress__bar-inner,
    ::ng-deep .health-low .mdc-linear-progress__bar-inner {
      background-color: #00ff00 !important;
    }

    ::ng-deep .hunger-medium .mdc-linear-progress__bar-inner,
    ::ng-deep .energy-medium .mdc-linear-progress__bar-inner,
    ::ng-deep .happiness-medium .mdc-linear-progress__bar-inner,
    ::ng-deep .health-medium .mdc-linear-progress__bar-inner {
      background-color: #ffff00 !important;
    }

    ::ng-deep .hunger-high .mdc-linear-progress__bar-inner,
    ::ng-deep .energy-high .mdc-linear-progress__bar-inner,
    ::ng-deep .happiness-high .mdc-linear-progress__bar-inner,
    ::ng-deep .health-high .mdc-linear-progress__bar-inner {
      background-color: #ff0000 !important;
    }

    ::ng-deep .mdc-linear-progress {
      background-color: #0f3460 !important;
    }

    .value {
      text-align: right;
      font-size: 12px;
      font-weight: bold;
    }

    .extra-stats {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #00ff00;
    }

    .extra-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      background: rgba(0, 255, 0, 0.1);
      padding: 8px;
      border: 1px solid #00cc00;
      border-radius: 4px;
    }

    .extra-stat .value {
      font-weight: bold;
      text-align: right;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsDisplayComponent {
  @Input() pet!: Pet;

  getSeverity(value: number): 'low' | 'medium' | 'high' {
    if (value <= 33) return 'low';
    if (value <= 66) return 'medium';
    return 'high';
  }

  getAgeDisplay(): string {
    const now = new Date().getTime();
    const birth = new Date(this.pet.birth_date).getTime();
    const ageMs = now - birth;
    const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
    const ageDays = Math.floor(ageHours / 24);

    if (ageDays > 0) {
      return `${ageDays}d ${ageHours % 24}h`;
    }
    return `${ageHours}h`;
  }
}
