# 🎮 PIXEL PET - GUÍA DE IMPLEMENTACIÓN RÁPIDA

**Guía paso a paso para crear Pixel Pet Tamagotchi en 160 minutos**

---

## ⚡ OPCIÓN RÁPIDA: Usar InstApp CHECKLIST

En lugar de crear el proyecto manualmente, usa el **InstApp CHECKLIST.md** que ya tienes:

```
C:\Users\aless\Desktop\InstApp\CHECKLIST.md
```

**Pasos:**
1. Abre CHECKLIST.md
2. Sigue Fases 1-7 (85 minutos total)
3. Cuando crees componentes, usa los templates de abajo

---

## 📋 CHECKLIST RÁPIDO (160 min)

### FASE 1: Setup (15 min)
```bash
# 1. Crear proyecto
ng new pixel-pet --standalone --skip-git

# 2. Instalar Material
cd pixel-pet
ng add @angular/material

# 3. Instalar Supabase
npm install @supabase/supabase-js

# 4. Crear estructura
mkdir -p src/app/core/services
mkdir -p src/app/core/guards
mkdir -p src/app/core/models
mkdir -p src/app/features/auth/components
mkdir -p src/app/features/pet/components
mkdir -p src/app/features/profile
mkdir -p src/app/features/leaderboard
mkdir -p src/app/shared/components
mkdir -p src/app/layout
mkdir -p src/assets/sprites
```

---

### FASE 2: Autenticación (25 min)

#### 2.1 Crear tabla `profiles` en Supabase
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

#### 2.2 Crear `environment.ts`
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://YOUR_PROJECT.supabase.co',
    anonKey: 'YOUR_ANON_KEY'
  }
};
```

#### 2.3 Crear `core/services/auth.service.ts`
```typescript
import { Injectable, inject, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = createClient(
    environment.supabase.url,
    environment.supabase.anonKey
  );

  private currentUser$ = signal<any>(null);
  user = this.currentUser$.asReadonly();
  
  isLoggedIn = signal(false);

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const { data } = await this.supabase.auth.getSession();
    if (data.session) {
      this.currentUser$.set(data.session.user);
      this.isLoggedIn.set(true);
    }
  }

  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/pet`
      }
    });
    return { data, error };
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });
    return { data, error };
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser$.set(null);
    this.isLoggedIn.set(false);
  }

  getUser() {
    return this.currentUser$();
  }
}
```

#### 2.4 Crear `core/guards/auth.guard.ts`
```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

#### 2.5 Crear `features/auth/components/login.component.ts`
```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>🎮 Pixel Pet</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <button mat-raised-button color="primary" (click)="loginWithGoogle()">
            Continuar con Google
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: #201058;
    }
    mat-card {
      width: 300px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  async loginWithGoogle() {
    const { error } = await this.authService.signInWithGoogle();
    if (!error) {
      this.router.navigate(['/pet']);
    }
  }
}
```

---

### FASE 3: Base de Datos (20 min)

#### 3.1 Crear tabla `pets`
```sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  species TEXT CHECK (species IN ('cat', 'dog', 'dragon')),
  color TEXT,
  birth_date TIMESTAMP DEFAULT NOW(),
  death_date TIMESTAMP NULL,
  is_alive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pets"
ON pets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pets"
ON pets FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

#### 3.2 Crear tabla `pet_stats_history`
```sql
CREATE TABLE pet_stats_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  hunger INTEGER CHECK (hunger >= 0 AND hunger <= 100),
  energy INTEGER CHECK (energy >= 0 AND energy <= 100),
  happiness INTEGER CHECK (happiness >= 0 AND happiness <= 100),
  health INTEGER CHECK (health >= 0 AND health <= 100),
  timestamp TIMESTAMP DEFAULT NOW()
);

ALTER TABLE pet_stats_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pet stats"
ON pet_stats_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pets WHERE pets.id = pet_id AND pets.user_id = auth.uid()
  )
);

CREATE INDEX idx_pet_stats_pet_id ON pet_stats_history(pet_id);
```

#### 3.3 Crear tabla `pet_actions`
```sql
CREATE TABLE pet_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  action_type TEXT CHECK (action_type IN ('feed', 'play', 'sleep', 'clean')),
  timestamp TIMESTAMP DEFAULT NOW()
);

ALTER TABLE pet_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pet actions"
ON pet_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pets WHERE pets.id = pet_id AND pets.user_id = auth.uid()
  )
);
```

---

### FASE 4: Servicios Core (30 min)

#### 4.1 Crear `core/models/pet.model.ts`
```typescript
export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: 'cat' | 'dog' | 'dragon';
  color: string;
  birth_date: Date;
  death_date: Date | null;
  is_alive: boolean;
  created_at: Date;
}

export interface PetStats {
  hunger: number;      // 0-100
  energy: number;      // 0-100
  happiness: number;   // 0-100
  health: number;      // 0-100
}

export interface PetState {
  pet: Pet;
  stats: PetStats;
  age_days: number;
  evolution_stage: 'egg' | 'baby' | 'teen' | 'adult';
  animation_state: 'idle' | 'eating' | 'playing' | 'sleeping' | 'sick';
}
```

#### 4.2 Crear `core/services/pet.service.ts`
```typescript
import { Injectable, inject, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Pet, PetStats } from '../models/pet.model';

@Injectable({ providedIn: 'root' })
export class PetService {
  private supabase = createClient(
    environment.supabase.url,
    environment.supabase.anonKey
  );

  private currentPet$ = signal<Pet | null>(null);
  private currentStats$ = signal<PetStats>({
    hunger: 50,
    energy: 50,
    happiness: 50,
    health: 100
  });

  currentPet = this.currentPet$.asReadonly();
  currentStats = this.currentStats$.asReadonly();

  // Crear nueva mascota
  async createPet(name: string, species: 'cat' | 'dog' | 'dragon', color: string) {
    const { data, error } = await this.supabase
      .from('pets')
      .insert({
        name,
        species,
        color,
        is_alive: true
      })
      .select()
      .single();

    if (!error && data) {
      this.currentPet$.set(data);
      this.initializeStats(data.id);
    }
    return { data, error };
  }

  // Cargar mascota actual del usuario
  async loadCurrentPet() {
    const { data, error } = await this.supabase
      .from('pets')
      .select('*')
      .eq('is_alive', true)
      .single();

    if (!error && data) {
      this.currentPet$.set(data);
      await this.loadStats(data.id);
    }
    return { data, error };
  }

  // Cargar stats actuales
  private async loadStats(pet_id: string) {
    const { data, error } = await this.supabase
      .from('pet_stats_history')
      .select('*')
      .eq('pet_id', pet_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      this.currentStats$.set({
        hunger: data.hunger,
        energy: data.energy,
        happiness: data.happiness,
        health: data.health
      });
    }
  }

  // Inicializar stats para nueva mascota
  private async initializeStats(pet_id: string) {
    await this.supabase
      .from('pet_stats_history')
      .insert({
        pet_id,
        hunger: 50,
        energy: 100,
        happiness: 80,
        health: 100
      });
  }

  // Acción: Alimentar
  async feed() {
    const stats = this.currentStats$();
    stats.hunger = Math.max(0, stats.hunger - 50);
    stats.health = Math.min(100, stats.health + 10);
    await this.saveStats(stats);
    this.recordAction('feed');
  }

  // Acción: Jugar
  async play() {
    const stats = this.currentStats$();
    stats.energy = Math.max(0, stats.energy - 20);
    stats.happiness = Math.min(100, stats.happiness + 30);
    stats.hunger = Math.min(100, stats.hunger + 10);
    await this.saveStats(stats);
    this.recordAction('play');
  }

  // Acción: Dormir
  async sleep() {
    const stats = this.currentStats$();
    stats.energy = 100;
    stats.health = Math.min(100, stats.health + 5);
    await this.saveStats(stats);
    this.recordAction('sleep');
  }

  // Acción: Limpiar
  async clean() {
    const stats = this.currentStats$();
    stats.health = Math.min(100, stats.health + 15);
    await this.saveStats(stats);
    this.recordAction('clean');
  }

  private async saveStats(stats: PetStats) {
    const pet = this.currentPet$();
    if (pet) {
      await this.supabase
        .from('pet_stats_history')
        .insert({
          pet_id: pet.id,
          hunger: stats.hunger,
          energy: stats.energy,
          happiness: stats.happiness,
          health: stats.health
        });
      this.currentStats$.set(stats);
    }
  }

  private async recordAction(action: string) {
    const pet = this.currentPet$();
    if (pet) {
      await this.supabase
        .from('pet_actions')
        .insert({
          pet_id: pet.id,
          action_type: action
        });
    }
  }

  // Marcar mascota como muerta
  async markAsDead() {
    const pet = this.currentPet$();
    if (pet) {
      await this.supabase
        .from('pets')
        .update({ is_alive: false, death_date: new Date() })
        .eq('id', pet.id);
      this.currentPet$.set(null);
    }
  }
}
```

---

### FASE 5: Componentes (40 min)

#### 5.1 Crear `features/pet/components/pet-display.component.ts`
```typescript
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pet, PetStats } from '../../../core/models/pet.model';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pet-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pet-canvas-container">
      <canvas #petCanvas width="320" height="240"></canvas>
    </div>
  `,
  styles: [`
    .pet-canvas-container {
      display: flex;
      justify-content: center;
      padding: 20px;
      background: #201058;
      border-radius: 8px;
    }
    canvas {
      border: 3px solid #f0c020;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetDisplayComponent implements OnInit {
  @Input() pet!: Pet;
  @Input() stats!: PetStats;

  ngOnInit() {
    this.drawPet();
  }

  drawPet() {
    // Implementar dibujo simple de mascota 8-bits
    // Por ahora: rectángulo de color
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.fillStyle = this.pet.color || '#ff1010';
      ctx.fillRect(50, 50, 64, 64);
    }
  }
}
```

#### 5.2 Crear `features/pet/components/pet-actions.component.ts`
```typescript
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { PetService } from '../../../core/services/pet.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pet-actions',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="actions-container">
      <button mat-raised-button color="primary" (click)="feed()">
        🍖 Alimentar
      </button>
      <button mat-raised-button color="accent" (click)="play()">
        🎮 Jugar
      </button>
      <button mat-raised-button (click)="sleep()">
        😴 Dormir
      </button>
      <button mat-raised-button color="warn" (click)="clean()">
        🧹 Limpiar
      </button>
    </div>
  `,
  styles: [`
    .actions-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      padding: 20px;
      background: #201058;
      border-radius: 8px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetActionsComponent {
  private petService = inject(PetService);
  private router = inject(Router);

  cooldown = signal(false);

  async feed() {
    if (this.cooldown()) return;
    await this.petService.feed();
    this.setCooldown();
  }

  async play() {
    if (this.cooldown()) return;
    await this.petService.play();
    this.setCooldown();
  }

  async sleep() {
    if (this.cooldown()) return;
    await this.petService.sleep();
    this.setCooldown();
  }

  async clean() {
    if (this.cooldown()) return;
    await this.petService.clean();
    this.setCooldown();
  }

  private setCooldown() {
    this.cooldown.set(true);
    setTimeout(() => this.cooldown.set(false), 500);
  }
}
```

#### 5.3 Crear `features/pet/components/stats-display.component.ts`
```typescript
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PetStats } from '../../../core/models/pet.model';

@Component({
  selector: 'app-stats-display',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  template: `
    <div class="stats-container">
      <div class="stat">
        <label>🍽️ Hambre</label>
        <mat-progress-bar mode="determinate" [value]="stats.hunger"></mat-progress-bar>
        <span>{{ stats.hunger }}/100</span>
      </div>
      <div class="stat">
        <label>⚡ Energía</label>
        <mat-progress-bar mode="determinate" [value]="stats.energy"></mat-progress-bar>
        <span>{{ stats.energy }}/100</span>
      </div>
      <div class="stat">
        <label>😊 Felicidad</label>
        <mat-progress-bar mode="determinate" [value]="stats.happiness" color="accent"></mat-progress-bar>
        <span>{{ stats.happiness }}/100</span>
      </div>
      <div class="stat">
        <label>❤️ Salud</label>
        <mat-progress-bar mode="determinate" [value]="stats.health" color="warn"></mat-progress-bar>
        <span>{{ stats.health }}/100</span>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      padding: 20px;
      background: #201058;
      border-radius: 8px;
    }
    .stat {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    label {
      font-weight: bold;
      color: #f0c020;
    }
    span {
      font-size: 12px;
      color: #fff;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsDisplayComponent {
  @Input() stats!: PetStats;
}
```

#### 5.4 Crear dashboard main
Ver FASE 6 para la pantalla principal

---

### FASE 6: Features Adicionales (15 min)

#### 6.1 Crear `features/pet/pages/dashboard.component.ts`
```typescript
import { Component, inject, effect, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PetService } from '../../../core/services/pet.service';
import { AuthService } from '../../../core/services/auth.service';
import { PetDisplayComponent } from '../components/pet-display.component';
import { StatsDisplayComponent } from '../components/stats-display.component';
import { PetActionsComponent } from '../components/pet-actions.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PetDisplayComponent,
    StatsDisplayComponent,
    PetActionsComponent
  ],
  template: `
    <div class="dashboard" *ngIf="petService.currentPet() as pet">
      <h1>{{ pet.name }} 🐾</h1>
      <app-pet-display [pet]="pet" [stats]="petService.currentStats()"></app-pet-display>
      <app-stats-display [stats]="petService.currentStats()"></app-stats-display>
      <app-pet-actions></app-pet-actions>
    </div>
    <div *ngIf="!petService.currentPet()" class="no-pet">
      <button (click)="createNewPet()">Crear Nueva Mascota</button>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: #f0c020;
    }
    .no-pet {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
  `]
})
export class DashboardComponent implements OnInit {
  petService = inject(PetService);
  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    await this.petService.loadCurrentPet();
  }

  createNewPet() {
    this.router.navigate(['/pet-create']);
  }
}
```

---

### FASE 7: Testing & Polish (15 min)

```bash
# 1. Compilar
ng build

# 2. Verificar errores TypeScript
ng serve

# 3. Testear flows principales en http://localhost:4200
```

---

## 🎨 Paleta de Colores Retro

```scss
$primary: #1f0d4f;      // Púrpura oscuro
$secondary: #f0c020;    // Amarillo
$accent: #ff1010;       // Rojo
$background: #201058;   // Fondo
$text: #ffffff;         // Blanco
$success: #10b981;      // Verde
$warning: #f59e0b;      // Naranja
```

---

## 📝 Próximos Pasos

1. **Seguir paso a paso** este guide
2. **Cada 15 minutos**: hacer un commit
3. **Al terminar**: tendrás app funcional completa
4. **Después**: agregar sprites pixel art, sonidos, etc.

---

## 🆘 Si tienes problemas

**Revisar:**
- `FRONTEND_SKILL_GUIDE.md` - Patterns Angular
- `SUPABASE_SKILL_GUIDE.md` - BD y Auth
- `PROJECT_ARCHITECTURE_GUIDE.md` - Estructura

¡Buena suerte! 🚀
