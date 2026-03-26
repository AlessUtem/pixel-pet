import { Component, Input, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pet } from '../../core/models/pet.model';
import { PixelRendererService } from '../../core/services/pixel-renderer.service';

@Component({
  selector: 'app-pet-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pet-display">
      <canvas #petCanvas class="pet-canvas"></canvas>
      <div class="pet-info">
        <h2>{{ pet.name }}</h2>
        <p class="species">{{ formatSpecies(pet.species) }} • {{ formatStage(pet.stage) }}</p>
        <p class="status" [class]="getPetHealthClass()">{{ getStatusMessage() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .pet-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 20px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 3px solid #00ff00;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    }

    .pet-canvas {
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
      border: 2px solid #00ff00;
      background: #0f3460;
      padding: 10px;
    }

    .pet-info {
      text-align: center;
      color: #00ff00;
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 10px #00ff00;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      text-transform: uppercase;
    }

    .species {
      margin: 5px 0;
      font-size: 12px;
      color: #00cc00;
      text-transform: capitalize;
    }

    .status {
      margin: 10px 0 0 0;
      font-size: 14px;
      font-weight: bold;
      min-height: 20px;
    }

    .status.healthy {
      color: #00ff00;
      text-shadow: 0 0 10px #00ff00;
    }

    .status.sick {
      color: #ffff00;
      text-shadow: 0 0 10px #ffff00;
    }

    .status.critical {
      color: #ff0000;
      text-shadow: 0 0 10px #ff0000;
      animation: blink 1s infinite;
    }

    .status.dead {
      color: #888888;
      text-shadow: 0 0 5px #888888;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.5; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetDisplayComponent implements OnInit {
  @Input() pet!: Pet;
  @ViewChild('petCanvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;

  constructor(private pixelRenderer: PixelRendererService) {}

  ngOnInit() {
    this.renderPet();
  }

  ngOnChanges() {
    this.renderPet();
  }

  private renderPet() {
    if (!this.canvasRef) return;

    const sprite = this.pixelRenderer.generatePetSprite(this.pet);
    const canvas = this.canvasRef.nativeElement;
    this.pixelRenderer.renderToCanvas(canvas, sprite, 4);
  }

  formatSpecies(species: string): string {
    return species.charAt(0).toUpperCase() + species.slice(1);
  }

  formatStage(stage: string): string {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  }

  getPetHealthClass(): string {
    if (!this.pet.is_alive) return 'dead';
    if (this.pet.health >= 70) return 'healthy';
    if (this.pet.health >= 30) return 'sick';
    return 'critical';
  }

  getStatusMessage(): string {
    if (!this.pet.is_alive) {
      return '💀 Your pet has passed away...';
    }

    const messages = [];

    if (this.pet.hunger >= 90) messages.push('🍗 STARVING!');
    else if (this.pet.hunger >= 70) messages.push('🍗 Hungry');

    if (this.pet.energy <= 10) messages.push('😴 Exhausted');
    else if (this.pet.energy <= 30) messages.push('😴 Tired');

    if (this.pet.health <= 20) messages.push('🤒 Very Sick');
    else if (this.pet.health <= 50) messages.push('🤒 Sick');

    if (this.pet.happiness >= 80) messages.push('😄 Very Happy!');
    else if (this.pet.happiness >= 50) messages.push('😊 Content');
    else if (this.pet.happiness <= 20) messages.push('😢 Sad');

    return messages.length > 0 ? messages.join(' | ') : '✨ Doing great!';
  }
}
