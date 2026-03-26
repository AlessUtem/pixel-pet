import { Injectable, inject, effect, signal } from '@angular/core';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { Pet, PET_CONSTANTS, getPetAge, getStage } from '../models/pet.model';
import { PetService } from './pet.service';
import { PetStatsService } from './pet-stats.service';

/**
 * GameEngineService
 * Orquesta toda la lógica avanzada del juego:
 * - Actualización automática de stats cada minuto
 * - Evolución de mascota por edad
 * - Sistema de muerte
 * - Snapshots de historial
 * - Experiencia y logros
 */
@Injectable({
  providedIn: 'root'
})
export class GameEngineService {
  private petService = inject(PetService);
  private petStatsService = inject(PetStatsService);

  private gameLoopInterval: any;
  private readonly GAME_TICK_MS = 60000; // 1 minuto

  // Signals para tracking
  private gameRunning = signal(false);
  private lastUpdateTime = signal<number>(0);

  constructor() {
    // Iniciar/detener game loop cuando haya pet actual
    effect(() => {
      const pet = this.petService.currentPet();
      if (pet && pet.is_alive) {
        this.startGameEngine(pet.id);
      } else {
        this.stopGameEngine();
      }
    });
  }

  /**
   * Iniciar el motor del juego
   */
  private startGameEngine(petId: string) {
    if (this.gameRunning()) return;

    this.gameRunning.set(true);
    this.lastUpdateTime.set(Date.now());

    // Game loop: ejecuta cada minuto
    this.gameLoopInterval = setInterval(() => {
      this.gameTick(petId);
    }, this.GAME_TICK_MS);

    console.log('🎮 Game engine started for pet:', petId);
  }

  /**
   * Detener el motor del juego
   */
  private stopGameEngine() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
    this.gameRunning.set(false);
    console.log('⏹️ Game engine stopped');
  }

  /**
   * Tick del juego: ejecuta toda la lógica cada minuto
   */
  private async gameTick(petId: string) {
    const pet = this.petService.currentPet();
    if (!pet || pet.id !== petId) return;

    try {
      // 1. Aplicar decaimiento de stats
      await this.applyStatsDecay(petId, pet);

      // 2. Revisar evolución
      await this.checkEvolution(petId, pet);

      // 3. Revisar muerte
      await this.checkDeath(petId, pet);

      // 4. Registrar snapshot cada 5 minutos
      const now = Date.now();
      if (now - this.lastUpdateTime() > 300000) {
        await this.recordSnapshot(petId, pet);
        this.lastUpdateTime.set(now);
      }
    } catch (error) {
      console.error('Error in game tick:', error);
    }
  }

  /**
   * Aplicar decaimiento de stats natural
   */
  private async applyStatsDecay(petId: string, pet: Pet) {
    const decayMinutes = this.GAME_TICK_MS / 60000;

    let updatedStats: Partial<Pet> = {
      hunger: Math.min(
        PET_CONSTANTS.STATS.MAX_HUNGER,
        pet.hunger + PET_CONSTANTS.DECAY_RATES.HUNGER_PER_MINUTE * decayMinutes
      ),
      energy: Math.max(
        PET_CONSTANTS.STATS.MIN_STATS,
        pet.energy - PET_CONSTANTS.DECAY_RATES.ENERGY_PER_MINUTE * decayMinutes
      ),
      happiness: Math.max(
        PET_CONSTANTS.STATS.MIN_STATS,
        pet.happiness - PET_CONSTANTS.DECAY_RATES.HAPPINESS_PER_MINUTE * decayMinutes
      ),
    };

    // Aplicar daño por hambre
    if (updatedStats.hunger! > 80) {
      updatedStats.health = Math.max(
        PET_CONSTANTS.STATS.MIN_STATS,
        pet.health - 5
      );
    }

    // Aplicar daño por baja energía
    if (updatedStats.energy! < 20) {
      updatedStats.health = Math.max(
        PET_CONSTANTS.STATS.MIN_STATS,
        (updatedStats.health || pet.health) - 2
      );
    }

    // Aplicar daño por tristeza
    if (updatedStats.happiness! < 20) {
      updatedStats.health = Math.max(
        PET_CONSTANTS.STATS.MIN_STATS,
        (updatedStats.health || pet.health) - 1
      );
    }

    await this.petService.updatePetStats(petId, updatedStats);
  }

  /**
   * Revisar y aplicar evolución
   */
  private async checkEvolution(petId: string, pet: Pet) {
    const ageHours = getPetAge(pet.birth_date);
    const newStage = getStage(ageHours);

    if (newStage !== pet.stage) {
      console.log(`🦋 Pet evolved: ${pet.stage} → ${newStage}`);

      // Boost en experiencia por evolución
      const experienceBonus = newStage === 'baby' ? 50 : newStage === 'teen' ? 100 : 200;

      await this.petService.updatePetStats(petId, {
        stage: newStage,
        experience: pet.experience + experienceBonus,
        // Pequeño boost de stats en evolución
        health: Math.min(PET_CONSTANTS.STATS.MAX_HEALTH, pet.health + 10),
        happiness: Math.min(PET_CONSTANTS.STATS.MAX_HAPPINESS, pet.happiness + 10),
      });

      // Log de evolución
      await this.petService.logPetAction(petId, 'sleep', 0); // Placeholder para evolución
    }
  }

  /**
   * Revisar condiciones de muerte
   */
  private async checkDeath(petId: string, pet: Pet) {
    let isDeadNow = false;
    let deathReason = '';

    // Condición 1: Hambre extrema
    if (pet.hunger >= PET_CONSTANTS.DEATH_CONDITIONS.HUNGER_THRESHOLD) {
      isDeadNow = true;
      deathReason = 'Starvation';
    }

    // Condición 2: Health crítica
    if (pet.health <= PET_CONSTANTS.DEATH_CONDITIONS.HEALTH_THRESHOLD) {
      isDeadNow = true;
      deathReason = 'Health failure';
    }

    // Condición 3: Felicidad muy baja por mucho tiempo
    if (pet.happiness < 10) {
      // Aquí necesitaríamos trackear cuánto tiempo ha estado así
      // Por ahora, simplemente lo marcamos como triste
      isDeadNow = pet.health <= 20; // Muere si está muy triste + enfermo
      if (isDeadNow) deathReason = 'Heartbreak';
    }

    if (isDeadNow && pet.is_alive) {
      console.log(`💀 Pet died: ${deathReason}`);

      await this.petService.updatePetStats(petId, {
        is_alive: false,
        death_date: new Date().toISOString(),
      });

      // Registrar último snapshot
      await this.recordSnapshot(petId, pet);
    }
  }

  /**
   * Registrar snapshot de stats para gráficos
   */
  private async recordSnapshot(petId: string, pet: Pet) {
    const updatedPet = this.petService.currentPet();
    if (!updatedPet) return;

    await this.petService.recordStatsSnapshot(petId, updatedPet);
  }

  /**
   * API Pública: Obtener estado actual del juego
   */
  getGameStatus(): {
    running: boolean;
    lastUpdate: number;
    pet: Pet | null;
  } {
    return {
      running: this.gameRunning(),
      lastUpdate: this.lastUpdateTime(),
      pet: this.petService.currentPet(),
    };
  }

  /**
   * API Pública: Simular N minutos (para testing)
   */
  async fastForward(minutes: number) {
    const pet = this.petService.currentPet();
    if (!pet) return;

    console.log(`⏩ Fast-forwarding ${minutes} minutes...`);

    for (let i = 0; i < minutes; i++) {
      await this.gameTick(pet.id);
      // Wait a bit entre ticks
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * API Pública: Resetear stats a valores iniciales (para testing)
   */
  async resetPetStats(petId: string) {
    await this.petService.updatePetStats(petId, {
      hunger: 50,
      energy: 100,
      happiness: 75,
      health: 100,
    });
  }
}
