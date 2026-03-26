# 🎮 FASE 6: Game Mechanics Avanzados

## Overview

FASE 6 implementa la **lógica core del juego** con:
- **Stats Decay**: Decaimiento automático de stats cada minuto
- **Pet Evolution**: 4 stages con duración configurable
- **Death System**: Condiciones de muerte realistas
- **Game Engine**: Orquestación de toda la lógica
- **Animations**: Estados visuales dinámicos

## Arquitectura

### GameEngineService
El orquestador principal que ejecuta el "game loop" cada minuto.

```typescript
// Iniciar automáticamente
gameEngine.startGameEngine(petId);

// Game loop ejecuta:
1. applyStatsDecay() - Hambre sube, energía baja
2. checkEvolution() - Evolucionar si es tiempo
3. checkDeath() - Revisar condiciones de muerte
4. recordSnapshot() - Registrar para gráficos
```

### Stats Decay

**Cada minuto:**
- Hambre +0.5
- Energía -0.3
- Felicidad -0.1

**Efectos especiales:**
- Si Hambre > 80: Health -5
- Si Energía < 20: Health -2
- Si Felicidad < 20: Health -1

### Pet Evolution

**4 Stages por edad:**

| Stage | Edad | Duración | Características |
|-------|------|----------|-----------------|
| 🥚 Egg | 0h | 24 horas | Forma ovalada, color naranja |
| 👶 Baby | 24h | 48 horas | Más pequeño, azul |
| 👦 Teen | 72h | 96 horas | Mediano, verde |
| 👨 Adult | 168h+ | Indefinido | Máximo tamaño, rojo |

**En cada evolución:**
- +50/100/200 experiencia
- +10 health
- +10 happiness

### Death System

**Pet muere si:**
1. `Hambre >= 100` (Starvation)
2. `Health <= 0` (Health failure)
3. `Felicidad < 10 + Health < 20` (Heartbreak)

**Al morir:**
- `is_alive = false`
- `death_date = NOW()`
- Se registra último snapshot

### Animations

**Estados visuales según stats:**

| Estado | Condición | Efecto |
|--------|-----------|--------|
| Idle | Normal | Respiración suave |
| Happy | Felicidad >= 80 | Salta arriba/abajo |
| Sad | Felicidad <= 20 | Cabeza colgando |
| Sleepy | Energía <= 10 | Parpadea |
| Starving | Hambre >= 90 | Tiembla |
| Sick | Health <= 30 | Se tambalea |
| Death | is_alive = false | Se tumba lentamente |

## Constantes del Juego

```typescript
// stats/min
HUNGER_PER_MINUTE: 0.5
ENERGY_PER_MINUTE: 0.3
HAPPINESS_PER_MINUTE: 0.1

// Acciones
FEED: Hambre -30, Energía -5
PLAY: Felicidad +20, Energía -15, Hambre +10
SLEEP: Energía +30, Hambre +5
PET: Felicidad +10, Energía -3

// Evolución
EGG_DURATION: 24 horas
BABY_DURATION: 48 horas
TEEN_DURATION: 96 horas
```

## Persistencia

Todo se guarda en Supabase:

### Tables Involucradas
- **pets** - Estado actual (hunger, energy, happiness, health, stage, is_alive)
- **pet_stats_history** - Snapshots cada 5 minutos para gráficos
- **pet_actions** - Log de acciones del usuario
- **profiles** - Score del usuario

### Snapshot Recording
- Cada 5 minutos se guarda snapshot de stats
- Permite generar gráficos de tendencia
- Usado para leaderboard (avg_pet_health)

## Flujo Completo

```
User abre app
    ↓
Dashboard carga pet
    ↓
GameEngine.startGameEngine(petId)
    ↓
Game Loop cada 60 segundos:
    ├─ Stats Decay
    ├─ Check Evolution (si cambió stage)
    ├─ Check Death (si muere)
    ├─ Record Snapshot (cada 5 min)
    └─ Update UI (gracias a Signals)
    ↓
User hace acción (feed/play/sleep/pet)
    ↓
Stats actualizan + se registra en pet_actions
    ↓
Game loop continúa...
```

## Testing

### Fast Forward (para testing)
```typescript
await gameEngine.fastForward(60); // Simular 60 minutos
```

### Reset Stats
```typescript
await gameEngine.resetPetStats(petId); // Volver a valores iniciales
```

## Performance Considerations

- **Game loop cada 60 segundos** (no cada frame)
- **Snapshots cada 5 minutos** (no continuos)
- **Signals para reactividad** (eficiente)
- **RLS en Supabase** (seguridad)
- **Índices en pet_id** (queries rápidas)

## Próximas Mejoras (FASE 7)

- [ ] Achievements/Badges
- [ ] Pet breeding
- [ ] Multiplayer battles
- [ ] Animations más suave con canvas
- [ ] Sonido fx
- [ ] Persistencia offline (IndexedDB)

---

**Timestamp:** Generated during FASE 6 implementation
**Author:** Pixel Pet Dev Team + Copilot
