/**
 * Models para Pixel Pet
 */

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: string; // 'cat' | 'dog' | 'dragon' | 'generic'
  stage: 'egg' | 'baby' | 'teen' | 'adult';

  // Stats
  hunger: number;
  energy: number;
  happiness: number;
  health: number;

  // Metadata
  birth_date: string;
  last_action_at: string;
  is_alive: boolean;
  death_date?: string;

  // Experience
  experience: number;
  total_actions: number;

  created_at: string;
  updated_at: string;
}

export interface PetAction {
  id: string;
  pet_id: string;
  action_type: 'feed' | 'play' | 'sleep' | 'pet';
  value_change?: number;
  created_at: string;
}

export interface PetStatsHistory {
  id: string;
  pet_id: string;
  hunger: number;
  energy: number;
  happiness: number;
  health: number;
  stage: string;
  recorded_at: string;
}

export interface PetCreationRequest {
  name: string;
  species: string;
}

/**
 * Constantes del juego
 */
export const PET_CONSTANTS = {
  STATS: {
    MAX_HUNGER: 100,
    MAX_ENERGY: 100,
    MAX_HAPPINESS: 100,
    MAX_HEALTH: 100,
    MIN_STATS: 0,
  },
  DECAY_RATES: {
    HUNGER_PER_MINUTE: 0.5,
    ENERGY_PER_MINUTE: 0.3,
    HAPPINESS_PER_MINUTE: 0.1,
  },
  ACTIONS: {
    FEED_HUNGER_REDUCE: -30,
    FEED_ENERGY_COST: 5,
    PLAY_HAPPINESS_INCREASE: 20,
    PLAY_ENERGY_COST: 15,
    PLAY_HUNGER_INCREASE: 10,
    SLEEP_ENERGY_INCREASE: 30,
    SLEEP_HUNGER_INCREASE: 5,
    PET_HAPPINESS_INCREASE: 10,
    PET_ENERGY_COST: 3,
  },
  EVOLUTION: {
    EGG_DURATION_HOURS: 24, // 1 día
    BABY_DURATION_HOURS: 48, // 2 días
    TEEN_DURATION_HOURS: 96, // 4 días
    // ADULT: indefinido
  },
  DEATH_CONDITIONS: {
    HUNGER_THRESHOLD: 100,
    HEALTH_THRESHOLD: 0,
    HAPPINESS_THRESHOLD_DAYS: 3,
  },
};

/**
 * Helper para calcular edad del pet
 */
export function getPetAge(birthDate: string): number {
  const birth = new Date(birthDate).getTime();
  const now = new Date().getTime();
  return Math.floor((now - birth) / (1000 * 60 * 60)); // Horas
}

/**
 * Helper para obtener stage actual
 */
export function getStage(ageHours: number): Pet['stage'] {
  if (ageHours < 24) return 'egg';
  if (ageHours < 72) return 'baby';
  if (ageHours < 168) return 'teen';
  return 'adult';
}
