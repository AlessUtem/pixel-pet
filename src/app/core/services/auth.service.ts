import { Injectable, inject, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  total_score: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private router = inject(Router);

  // Signals
  user = signal<User | null>(null);
  userProfile = signal<UserProfile | null>(null);
  isLoading = signal(false);
  isAuthenticated = signal(false);

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );

    // Verificar sesión existente
    this.checkAuthStatus();

    // Escuchar cambios de auth
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.user.set(session.user);
        this.isAuthenticated.set(true);
        this.loadUserProfile(session.user.id);
      } else {
        this.user.set(null);
        this.userProfile.set(null);
        this.isAuthenticated.set(false);
      }
    });
  }

  /**
   * Verifica estado de autenticación actual
   */
  async checkAuthStatus() {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) throw error;

      if (data.session?.user) {
        this.user.set(data.session.user);
        this.isAuthenticated.set(true);
        await this.loadUserProfile(data.session.user.id);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  }

  /**
   * Login con Google
   */
  async loginWithGoogle() {
    try {
      this.isLoading.set(true);
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      this.isLoading.set(true);
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      this.user.set(null);
      this.userProfile.set(null);
      this.isAuthenticated.set(false);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Cargar perfil del usuario
   */
  private async loadUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url, total_score')
        .eq('id', userId)
        .single();

      if (error) {
        // Si no existe, crear perfil
        if (error.code === 'PGRST116') {
          await this.createUserProfile(userId);
          return;
        }
        throw error;
      }

      this.userProfile.set(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  /**
   * Crear perfil de usuario
   */
  private async createUserProfile(userId: string) {
    try {
      const user = this.user();
      if (!user) return;

      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player';

      const { data, error } = await this.supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          display_name: displayName,
          avatar_url: user.user_metadata?.avatar_url,
          total_score: 0,
        })
        .select()
        .single();

      if (error) throw error;
      this.userProfile.set(data);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(updates: Partial<UserProfile>) {
    try {
      const userId = this.user()?.id;
      if (!userId) throw new Error('No user logged in');

      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      this.userProfile.set(data);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Obtener token de acceso
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      return data.session?.access_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }
}
