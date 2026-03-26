import { Injectable, inject, signal } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Pet, PetAction, PetStatsHistory, PetCreationRequest } from '../models/pet.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private supabase: SupabaseClient;
  private authService = inject(AuthService);

  // Signals
  userPets = signal<Pet[]>([]);
  currentPet = signal<Pet | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  /**
   * Obtener todas las mascotas del usuario actual
   */
  async getUserPets(): Promise<Pet[]> {
    try {
      this.isLoading.set(true);
      const userId = this.authService.user()?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.userPets.set(data || []);
      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching pets';
      this.error.set(message);
      console.error(message, err);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Obtener una mascota por ID
   */
  async getPetById(petId: string): Promise<Pet | null> {
    try {
      this.isLoading.set(true);
      const { data, error } = await this.supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (error) throw error;

      this.currentPet.set(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching pet';
      this.error.set(message);
      console.error(message, err);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Crear nueva mascota
   */
  async createPet(request: PetCreationRequest): Promise<Pet | null> {
    try {
      this.isLoading.set(true);
      const userId = this.authService.user()?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const newPet = {
        user_id: userId,
        name: request.name,
        species: request.species,
        stage: 'egg' as const,
        hunger: 50,
        energy: 100,
        happiness: 75,
        health: 100,
        birth_date: new Date().toISOString(),
        last_action_at: new Date().toISOString(),
        is_alive: true,
        experience: 0,
        total_actions: 0,
      };

      const { data, error } = await this.supabase
        .from('pets')
        .insert([newPet])
        .select()
        .single();

      if (error) throw error;

      // Actualizar lista local
      this.userPets.update(pets => [data, ...pets]);
      this.currentPet.set(data);
      this.error.set(null);

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating pet';
      this.error.set(message);
      console.error(message, err);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Actualizar stats de una mascota
   */
  async updatePetStats(petId: string, updates: Partial<Pet>): Promise<Pet | null> {
    try {
      this.isLoading.set(true);

      const { data, error } = await this.supabase
        .from('pets')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', petId)
        .select()
        .single();

      if (error) throw error;

      // Actualizar signals
      if (this.currentPet()?.id === petId) {
        this.currentPet.set(data);
      }

      this.userPets.update(pets =>
        pets.map(p => (p.id === petId ? data : p))
      );

      this.error.set(null);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating pet stats';
      this.error.set(message);
      console.error(message, err);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Eliminar mascota
   */
  async deletePet(petId: string): Promise<boolean> {
    try {
      this.isLoading.set(true);

      const { error } = await this.supabase
        .from('pets')
        .delete()
        .eq('id', petId);

      if (error) throw error;

      // Actualizar signals
      if (this.currentPet()?.id === petId) {
        this.currentPet.set(null);
      }

      this.userPets.update(pets => pets.filter(p => p.id !== petId));
      this.error.set(null);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting pet';
      this.error.set(message);
      console.error(message, err);
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Registrar una acción del pet
   */
  async logPetAction(petId: string, actionType: PetAction['action_type'], valueChange?: number): Promise<PetAction | null> {
    try {
      const action = {
        pet_id: petId,
        action_type: actionType,
        value_change: valueChange,
      };

      const { data, error } = await this.supabase
        .from('pet_actions')
        .insert([action])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error logging pet action:', err);
      return null;
    }
  }

  /**
   * Obtener historial de stats de un pet
   */
  async getPetStatsHistory(petId: string, limit: number = 100): Promise<PetStatsHistory[]> {
    try {
      const { data, error } = await this.supabase
        .from('pet_stats_history')
        .select('*')
        .eq('pet_id', petId)
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error fetching pet stats history:', err);
      return [];
    }
  }

  /**
   * Registrar snapshot de stats (para gráficos)
   */
  async recordStatsSnapshot(petId: string, pet: Pet): Promise<PetStatsHistory | null> {
    try {
      const snapshot = {
        pet_id: petId,
        hunger: pet.hunger,
        energy: pet.energy,
        happiness: pet.happiness,
        health: pet.health,
        stage: pet.stage,
        recorded_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('pet_stats_history')
        .insert([snapshot])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error recording stats snapshot:', err);
      return null;
    }
  }

  /**
   * Obtener acciones recientes del pet
   */
  async getPetActionHistory(petId: string, limit: number = 50): Promise<PetAction[]> {
    try {
      const { data, error } = await this.supabase
        .from('pet_actions')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error fetching pet action history:', err);
      return [];
    }
  }

  /**
   * Obtener leaderboard
   */
  async getLeaderboard(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('leaderboard')
        .select('*')
        .order('rank')
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      return [];
    }
  }
}
