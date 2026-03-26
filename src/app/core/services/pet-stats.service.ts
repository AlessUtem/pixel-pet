import { Injectable, inject, effect } from '@angular/core';
import { interval } from 'rxjs';
import {
  Pet,
  PET_CONSTANTS,
  getPetAge,
  getStage,
} from '../models/pet.model';
import { PetService } from './pet.service';

@Injectable({
  providedIn: 'root'
})
export class PetStatsService {
  private petService = inject(PetService);
  private statsUpdateInterval: any;
  private readonly STATS_UPDATE_INTERVAL_MS = 60000; // 1 minuto

  constructor() {
    // Iniciar actualización automática cuando hay un pet actual
    effect(() => {
      const pet = this.petService.currentPet();
      if (pet && pet.is_alive) {
        this.startStatsDecay(pet.id);
      } else {
        this.stopStatsDecay();
      }
    });
  }

  /**
   * Iniciar decaimiento automático de stats
   */
  private startStatsDecay(petId: string) {
    // Limpiar intervalo anterior si existe
    this.stopStatsDecay();

    // Actualizar stats cada minuto
    this.statsUpdateInterval = setInterval(() => {
      this.applyStatsDecay(petId);
    }, this.STATS_UPDATE_INTERVAL_MS);
  }

  /**
   * Detener decaimiento de stats
   */
  private stopStatsDecay() {
    if (this.statsUpdateInterval) {
      clearInterval(this.statsUpdateInterval);
      this.statsUpdateInterval = null;
    }
  }

  /**
   * Aplicar decaimiento de stats (hambre aumenta, energía disminuye)
   */
  private async applyStatsDecay(petId: string) {
    const pet = this.petService.currentPet();
    if (!pet || !pet.is_alive) return;

    const decayMinutes = this.STATS_UPDATE_INTERVAL_MS / 60000; // Cuántos minutos pasaron

    let updatedPet: Partial<Pet> = {
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

    // Aplicar daño por hambre extrema
    if (updatedPet.hunger! >= 80) {
      updatedPet.health = Math.max(
        PET_CONSTANTS.STATS.MIN_STATS,
        pet.health - 2
      );
    }

    // Aplicar daño por baja felicidad
    if (updatedPet.happiness! <= 20) {
      updatedPet.health = Math.max(
        PET_CONSTANTS.STATS.MIN_STATS,
        (updatedPet.health || pet.health) - 1
      );
    }

    // Revisar si el pet muere
    if (updatedPet.hunger! >= PET_CONSTANTS.DEATH_CONDITIONS.HUNGER_THRESHOLD ||
        updatedPet.health! <= PET_CONSTANTS.DEATH_CONDITIONS.HEALTH_THRESHOLD) {
      updatedPet.is_alive = false;
      updatedPet.death_date = new Date().toISOString();
    }

    // Actualizar stage basado en edad
    const ageHours = getPetAge(pet.birth_date);
    const newStage = getStage(ageHours);
    if (newStage !== pet.stage) {
      updatedPet.stage = newStage;
    }

    // Guardar cambios en Supabase
    await this.petService.updatePetStats(petId, updatedPet);

    // Registrar snapshot cada 5 minutos para historial
    if (Math.random() < 0.2) { // 20% de probabilidad = aprox cada 5 minutos
      const updatedPetFull = this.petService.currentPet();
      if (updatedPetFull) {
        await this.petService.recordStatsSnapshot(petId, updatedPetFull);
      }
    }
  }

  /**
   * Acción: Alimentar
   */
  async feedPet(petId: string, pet: Pet): Promise<Pet | null> {
    const updated = {
      hunger: Math.max(
        PET_CONSTANTS.STATS.MIN_STATS,
        pet.hunger + PET_CONSTANTS.ACTIONS.FEED_HUNGER_REDUCE
      ),
      energy: Math.max(
        PET_CONSTANTS.STATS.MIN_STATS,
        pet.energy - PET_CONSTANTS.ACTIONS.FEED_ENERGY_COST
      ),
      total_actions: pet.total_actions + 1,
      last_action_at: new Date().toISOString(),
    };

    await this.petService.logPetAction(petId, 'feed', PET_CONSTANTS.ACTIONS.FEED_HUNGER_REDUCE);
    return this.petService.updatePetStats(petId, updated);
  }

  /**
   * Acción: Jugar
   */
  async playWithPet(petId: string, pet: Pet): Promise<Pet | null> {
    // No puede jugar si está muy cansado
    if (pet.energy < PET_CONSTANTS.ACTIONS.PLAY_ENERGY_COST) {
      throw new Error('Pet is too tired to play');
    }

    const updated = {
      happiness: Math.min(
        PET_CONSTANTS.STATS.MAX_HAPPINESS,
        pet.happiness + PET_CONSTANTS.ACTIONS.PLAY_HAPPINESS_INCREASE
      ),
      energy: pet.energy - PET_CONSTANTS.ACTIONS.PLAY_ENERGY_COST,
      hunger: Math.min(
        PET_CONSTANTS.STATS.MAX_HUNGER,
        pet.hunger + PET_CONSTANTS.ACTIONS.PLAY_HUNGER_INCREASE
      ),
      total_actions: pet.total_actions + 1,
      last_action_at: new Date().toISOString(),
    };

    await this.petService.logPetAction(petId, 'play', PET_CONSTANTS.ACTIONS.PLAY_HAPPINESS_INCREASE);
    return this.petService.updatePetStats(petId, updated);
  }

  /**
   * Acción: Dormir
   */
  async sleepPet(petId: string, pet: Pet): Promise<Pet | null> {
    const updated = {
      energy: Math.min(
        PET_CONSTANTS.STATS.MAX_ENERGY,
        pet.energy + PET_CONSTANTS.ACTIONS.SLEEP_ENERGY_INCREASE
      ),
      hunger: Math.min(
        PET_CONSTANTS.STATS.MAX_HUNGER,
        pet.hunger + PET_CONSTANTS.ACTIONS.SLEEP_HUNGER_INCREASE
      ),
      total_actions: pet.total_actions + 1,
      last_action_at: new Date().toISOString(),
    };

    await this.petService.logPetAction(petId, 'sleep', 0);
    return this.petService.updatePetStats(petId, updated);
  }

  /**
   * Acción: Acariciar
   */
  async petThePet(petId: string, pet: Pet): Promise<Pet | null> {
    const updated = {
      happiness: Math.min(
        PET_CONSTANTS.STATS.MAX_HAPPINESS,
        pet.happiness + PET_CONSTANTS.ACTIONS.PET_HAPPINESS_INCREASE
      ),
      energy: Math.max(
        PET_CONSTANTS.STATS.MIN_STATS,
        pet.energy - PET_CONSTANTS.ACTIONS.PET_ENERGY_COST
      ),
      total_actions: pet.total_actions + 1,
      last_action_at: new Date().toISOString(),
    };

    await this.petService.logPetAction(petId, 'pet', PET_CONSTANTS.ACTIONS.PET_HAPPINESS_INCREASE);
    return this.petService.updatePetStats(petId, updated);
  }

  /**
   * Calcular salud del pet (0-100)
   */
  getHealthStatus(health: number): 'healthy' | 'sick' | 'critical' {
    if (health >= 70) return 'healthy';
    if (health >= 30) return 'sick';
    return 'critical';
  }

  /**
   * Calcular estado del pet (descripción textual)
   */
  getPetStatus(pet: Pet): string {
    if (!pet.is_alive) {
      return 'Your pet has passed away...';
    }

    if (pet.hunger >= 90) {
      return 'Your pet is starving!';
    }
    if (pet.hunger >= 70) {
      return 'Your pet is hungry';
    }

    if (pet.energy <= 10) {
      return 'Your pet is exhausted';
    }
    if (pet.energy <= 30) {
      return 'Your pet is tired';
    }

    if (pet.health <= 20) {
      return 'Your pet is very sick';
    }
    if (pet.health <= 50) {
      return 'Your pet is not feeling well';
    }

    if (pet.happiness >= 80) {
      return 'Your pet is very happy!';
    }
    if (pet.happiness >= 50) {
      return 'Your pet is content';
    }
    if (pet.happiness <= 20) {
      return 'Your pet is sad';
    }

    return 'Your pet is doing fine';
  }

  /**
   * Calcular next evolution time
   */
  getNextEvolutionTime(pet: Pet): { stage: string; hoursRemaining: number } | null {
    const ageHours = getPetAge(pet.birth_date);

    if (pet.stage === 'egg' && ageHours < PET_CONSTANTS.EVOLUTION.EGG_DURATION_HOURS) {
      return {
        stage: 'baby',
        hoursRemaining: PET_CONSTANTS.EVOLUTION.EGG_DURATION_HOURS - ageHours,
      };
    }

    if (pet.stage === 'baby' && ageHours < PET_CONSTANTS.EVOLUTION.BABY_DURATION_HOURS) {
      return {
        stage: 'teen',
        hoursRemaining: PET_CONSTANTS.EVOLUTION.BABY_DURATION_HOURS - ageHours,
      };
    }

    if (pet.stage === 'teen' && ageHours < PET_CONSTANTS.EVOLUTION.TEEN_DURATION_HOURS) {
      return {
        stage: 'adult',
        hoursRemaining: PET_CONSTANTS.EVOLUTION.TEEN_DURATION_HOURS - ageHours,
      };
    }

    return null;
  }
}
