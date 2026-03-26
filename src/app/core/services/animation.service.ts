import { Injectable } from '@angular/core';
import { Pet } from '../models/pet.model';

export interface AnimationFrame {
  frameIndex: number;
  duration: number; // ms
  transform?: string;
  opacity?: number;
}

export interface PetAnimation {
  name: string;
  frames: AnimationFrame[];
  loop: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  /**
   * Obtener animación según el estado del pet
   */
  getAnimationForState(pet: Pet): PetAnimation {
    if (!pet.is_alive) {
      return this.getDeathAnimation();
    }

    if (pet.hunger >= 90) {
      return this.getStarvingAnimation();
    }

    if (pet.energy <= 10) {
      return this.getSleepyAnimation();
    }

    if (pet.happiness >= 80) {
      return this.getHappyAnimation();
    }

    if (pet.happiness <= 20) {
      return this.getSadAnimation();
    }

    if (pet.health <= 30) {
      return this.getSickAnimation();
    }

    return this.getIdleAnimation();
  }

  /**
   * Animación Idle (por defecto)
   */
  private getIdleAnimation(): PetAnimation {
    return {
      name: 'idle',
      loop: true,
      frames: [
        { frameIndex: 0, duration: 800 },
        { frameIndex: 1, duration: 800 },
      ],
    };
  }

  /**
   * Animación Caminando
   */
  private getWalkAnimation(): PetAnimation {
    return {
      name: 'walk',
      loop: true,
      frames: [
        { frameIndex: 0, duration: 200, transform: 'translateX(0)' },
        { frameIndex: 1, duration: 200, transform: 'translateX(10px)' },
        { frameIndex: 2, duration: 200, transform: 'translateX(20px)' },
        { frameIndex: 1, duration: 200, transform: 'translateX(10px)' },
      ],
    };
  }

  /**
   * Animación Comiendo
   */
  getEatingAnimation(): PetAnimation {
    return {
      name: 'eating',
      loop: false,
      frames: [
        { frameIndex: 0, duration: 200 },
        { frameIndex: 1, duration: 300, transform: 'scaleY(0.8)' },
        { frameIndex: 1, duration: 300, transform: 'scaleY(0.8)' },
        { frameIndex: 0, duration: 200 },
      ],
    };
  }

  /**
   * Animación Jugando
   */
  getPlayingAnimation(): PetAnimation {
    return {
      name: 'playing',
      loop: false,
      frames: [
        { frameIndex: 0, duration: 200 },
        { frameIndex: 1, duration: 300, transform: 'translateY(-20px) rotate(10deg)' },
        { frameIndex: 1, duration: 300, transform: 'translateY(-20px) rotate(-10deg)' },
        { frameIndex: 0, duration: 200, transform: 'translateY(0)' },
      ],
    };
  }

  /**
   * Animación Durmiendo
   */
  getSleepingAnimation(): PetAnimation {
    return {
      name: 'sleeping',
      loop: true,
      frames: [
        { frameIndex: 0, duration: 600, transform: 'rotate(5deg)' },
        { frameIndex: 1, duration: 600, transform: 'rotate(-5deg)' },
      ],
    };
  }

  /**
   * Animación Cansado (Sleepy)
   */
  private getSleepyAnimation(): PetAnimation {
    return {
      name: 'sleepy',
      loop: true,
      frames: [
        { frameIndex: 0, duration: 1000 },
        { frameIndex: 1, duration: 100 },
        { frameIndex: 0, duration: 1000 },
        { frameIndex: 1, duration: 100 },
        { frameIndex: 1, duration: 200 },
      ],
    };
  }

  /**
   * Animación Muerto
   */
  private getDeathAnimation(): PetAnimation {
    return {
      name: 'death',
      loop: false,
      frames: [
        { frameIndex: 0, duration: 500, opacity: 1 },
        { frameIndex: 1, duration: 300, opacity: 0.7, transform: 'rotate(90deg)' },
        { frameIndex: 1, duration: 1000, opacity: 0.5, transform: 'rotate(90deg)' },
      ],
    };
  }

  /**
   * Animación Hambriento
   */
  private getStarvingAnimation(): PetAnimation {
    return {
      name: 'starving',
      loop: true,
      frames: [
        { frameIndex: 0, duration: 300 },
        { frameIndex: 1, duration: 150, transform: 'scale(0.95)' },
        { frameIndex: 0, duration: 300 },
        { frameIndex: 1, duration: 150, transform: 'scale(0.95)' },
      ],
    };
  }

  /**
   * Animación Feliz
   */
  private getHappyAnimation(): PetAnimation {
    return {
      name: 'happy',
      loop: true,
      frames: [
        { frameIndex: 0, duration: 300, transform: 'translateY(0)' },
        { frameIndex: 1, duration: 300, transform: 'translateY(-10px)' },
      ],
    };
  }

  /**
   * Animación Triste
   */
  private getSadAnimation(): PetAnimation {
    return {
      name: 'sad',
      loop: true,
      frames: [
        { frameIndex: 0, duration: 800, transform: 'translateY(0)' },
        { frameIndex: 1, duration: 200, transform: 'translateY(5px)' },
        { frameIndex: 1, duration: 200, transform: 'translateY(-5px)' },
        { frameIndex: 1, duration: 200, transform: 'translateY(5px)' },
      ],
    };
  }

  /**
   * Animación Enfermo
   */
  private getSickAnimation(): PetAnimation {
    return {
      name: 'sick',
      loop: true,
      frames: [
        { frameIndex: 0, duration: 400, transform: 'rotate(-3deg) opacity(0.8)' },
        { frameIndex: 1, duration: 200, transform: 'rotate(3deg) opacity(1)' },
        { frameIndex: 0, duration: 400, transform: 'rotate(-3deg) opacity(0.8)' },
      ],
    };
  }

  /**
   * Calcular duración total de animación
   */
  getTotalDuration(animation: PetAnimation): number {
    return animation.frames.reduce((sum, frame) => sum + frame.duration, 0);
  }

  /**
   * Obtener frame en un tiempo específico
   */
  getFrameAtTime(animation: PetAnimation, time: number): AnimationFrame {
    let elapsed = 0;

    for (const frame of animation.frames) {
      if (elapsed + frame.duration >= time) {
        return frame;
      }
      elapsed += frame.duration;
    }

    // Si loop, resetear
    if (animation.loop) {
      return this.getFrameAtTime(animation, time % this.getTotalDuration(animation));
    }

    // Si no loop, retornar último frame
    return animation.frames[animation.frames.length - 1];
  }

  /**
   * Generar CSS animation keyframes
   */
  generateKeyframes(animation: PetAnimation): string {
    const totalDuration = this.getTotalDuration(animation);
    let keyframes = `@keyframes ${animation.name} {\n`;

    let cumulativeTime = 0;
    for (const frame of animation.frames) {
      const percentage = (cumulativeTime / totalDuration) * 100;
      keyframes += `  ${percentage.toFixed(1)}% {\n`;
      if (frame.transform) {
        keyframes += `    transform: ${frame.transform};\n`;
      }
      if (frame.opacity !== undefined) {
        keyframes += `    opacity: ${frame.opacity};\n`;
      }
      keyframes += `  }\n`;
      cumulativeTime += frame.duration;
    }

    keyframes += `}\n`;
    return keyframes;
  }

  /**
   * Obtener velocidad de animación en segundos
   */
  getAnimationDurationSeconds(animation: PetAnimation): number {
    return this.getTotalDuration(animation) / 1000;
  }
}
