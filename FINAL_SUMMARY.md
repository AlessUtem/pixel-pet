# 🎮 Pixel Pet - Proyecto Completo

## 🚀 Overview

**Pixel Pet** es un juego web de mascotas virtuales tipo Tamagotchi con:
- Gráficos retro 8-bit en canvas
- Autenticación con Google OAuth
- Base de datos PostgreSQL (Supabase)
- Sistema completo de game mechanics
- UI responsiva con Material Design
- Leaderboard global

**Stack**: Angular 17 (Signals) + Supabase + Canvas API

## 📋 Proyecto Completado

### ✅ FASE 1: Setup Inicial
- ✅ Estructura Angular 17 con Signals
- ✅ Routing lazy-loaded
- ✅ Environment configuration
- ✅ Guards + Interceptors

**Archivos:**
- `src/app/app.config.ts`
- `src/app/app.routes.ts`
- `src/app/app.component.ts`
- `src/main.ts`
- `src/styles.scss`

### ✅ FASE 2: Autenticación Google OAuth
**AuthService completo:**
- Login con Google OAuth
- Sesión persistente
- Creación automática de perfil
- Token management

**Componentes:**
- `LoginComponent` - UI retro con botón de Sign In

**Documentación:**
- `GOOGLE_OAUTH_SETUP.md` - Guía paso a paso

**Status**: Código listo, falta configurar credenciales en Supabase

### ✅ FASE 3: Servicios de Datos

**PetService:**
- CRUD completo de mascotas
- Obtener todas las mascotas del usuario
- Registrar acciones
- Obtener leaderboard
- Snapshot de historial

**PetStatsService:**
- Acciones: feed, play, sleep, pet
- Cálculo de stats
- Status del pet
- Evolución siguiente

**PixelRendererService:**
- Generador de sprites 8-bit
- 4 especies: cat, dog, dragon, generic
- 4 stages con colores diferentes
- Renderizado a canvas

**Modelos:**
```typescript
Pet {
  id, user_id, name, species, stage
  hunger, energy, happiness, health
  birth_date, is_alive, death_date
  experience, total_actions
}
```

### ✅ FASE 4: Componentes UI

**PetDisplayComponent**
- Renderiza pixel art en canvas
- Muestra nombre y estado
- CSS 8-bit con bordes fluorescentes

**StatsDisplayComponent**
- 4 barras de progreso Material
- Color cambia por severidad
- Información extra (XP, acciones, edad)

**PetActionsComponent**
- 4 botones: Feed, Play, Sleep, Pet
- Validaciones (energía suficiente, vivo, etc)
- Mensajes de éxito/error
- Tooltip con explicación

**DashboardComponent**
- Layout principal con grid
- Selector de múltiples mascotas
- Integración de todos los componentes
- Navegación a profile/leaderboard

### ✅ FASE 5: Funcionalidades

**PetCreationComponent**
- Formulario con validación
- Selector de especie (cat, dog, dragon, generic)
- Preview de evolución

**ProfileComponent**
- Ver/editar display name
- Avatar
- Total score

**LeaderboardComponent**
- Top 50 jugadores
- Medallas (oro/plata/bronce)
- Info de mascotas por jugador
- Highlight del usuario actual

### ✅ FASE 6: Game Mechanics Avanzados

**GameEngineService**
- Game loop cada 60 segundos
- Stats decay automático
- Pet evolution (4 stages por edad)
- Death system (3 condiciones)
- Snapshots cada 5 minutos

**AnimationService**
- 9 animaciones según estado
- Idle, Happy, Sad, Sleepy, Starving, Sick, Death
- Keyframes CSS dinámicos
- Transform + opacity

**Mecánicas:**
```
Stats Decay (por minuto):
  Hambre: +0.5
  Energía: -0.3
  Felicidad: -0.1

Acciones:
  Feed: Hambre -30, Energía -5
  Play: Felicidad +20, Energía -15, Hambre +10
  Sleep: Energía +30, Hambre +5
  Pet: Felicidad +10, Energía -3

Evolución:
  Egg (0-24h) → Baby (24-72h) → Teen (72-168h) → Adult (168h+)

Muerte:
  - Hambre >= 100
  - Health <= 0
  - Felicidad < 10 + Health < 20
```

## 🗄️ Base de Datos (Supabase)

### Tables
- **profiles** - Usuarios y scores
- **pets** - Estado actual de mascotas
- **pet_actions** - Log de acciones
- **pet_stats_history** - Snapshots para gráficos
- **leaderboard** - Vista materializada

### RLS Policies
- Usuarios solo ven sus propios datos
- Lectura/escritura segregada por user_id

### Índices
- pet_id (queries rápidas)
- created_at (ordenamiento)
- recorded_at (historial)

## 📊 Arquitectura

```
AppComponent
├── auth.guard (protege rutas)
├── LoginComponent (FASE 2)
│   └── AuthService (Google OAuth)
│
├── DashboardComponent (FASE 4)
│   ├── PetDisplayComponent (canvas)
│   ├── StatsDisplayComponent (bars)
│   ├── PetActionsComponent (buttons)
│   └── GameEngineService (loop)
│       ├── PetService (CRUD)
│       ├── PetStatsService (acciones)
│       └── PixelRendererService (sprites)
│
├── PetCreationComponent (FASE 5)
│   └── PetService
│
├── ProfileComponent (FASE 5)
│   └── AuthService
│
└── LeaderboardComponent (FASE 5)
    └── PetService
```

## 🎯 Estado Actual

### ✅ Completado
- [x] Estructura base + routing
- [x] Autenticación (code ready)
- [x] Servicios de datos
- [x] Componentes UI
- [x] Funcionalidades
- [x] Game mechanics

### ⏳ Pendiente
- [ ] Configurar Google OAuth en Supabase
- [ ] Unit tests
- [ ] E2E tests
- [ ] Deploy a Vercel

## 🚀 Próximos Pasos (FASE 7)

### 1. Configurar OAuth (15 min)
```bash
# Google Cloud Console
1. Crear OAuth app
2. Copiar Client ID + Secret
3. Supabase → Settings → Auth → Google → Pegar credenciales
```

### 2. Testing (30 min)
```bash
npm install --save-dev jasmine karma @angular/core/testing
ng test # Unit tests
ng e2e  # E2E tests
```

### 3. Deploy (20 min)
```bash
npm run build
# Vercel: conectar repo + env variables
```

## 📁 Estructura de Carpetas

```
pixel-pet/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── pet.service.ts
│   │   │   │   ├── pet-stats.service.ts
│   │   │   │   ├── game-engine.service.ts
│   │   │   │   ├── pixel-renderer.service.ts
│   │   │   │   └── animation.service.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   └── models/
│   │   │       └── pet.model.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   └── components/
│   │   │   │       └── login.component.ts
│   │   │   ├── pet/
│   │   │   │   ├── components/
│   │   │   │   │   ├── pet-display.component.ts
│   │   │   │   │   ├── stats-display.component.ts
│   │   │   │   │   ├── pet-actions.component.ts
│   │   │   │   │   └── pet-creation.component.ts
│   │   │   │   └── pages/
│   │   │   │       └── dashboard.component.ts
│   │   │   ├── profile/
│   │   │   │   └── profile.component.ts
│   │   │   └── leaderboard/
│   │   │       └── leaderboard.component.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── app.component.ts
│   │   └── styles.scss
│   ├── main.ts
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
├── database-schema.sql
├── package.json
├── GOOGLE_OAUTH_SETUP.md
├── PHASE_6_MECHANICS.md
└── README.md
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17 (Signals, Standalone) |
| UI Framework | Material Design |
| Rendering | Canvas API (Pixel Art) |
| Backend | Supabase (PostgreSQL) |
| Authentication | Google OAuth 2.0 |
| State | Signals (Angular) |
| Build | Angular CLI |
| Styling | SCSS + Material |

## 📦 Dependencias

```json
{
  "@angular/core": "^17.0.0",
  "@angular/material": "^17.0.0",
  "@supabase/supabase-js": "^2.38.0",
  "rxjs": "^7.8.0"
}
```

## 🎮 Cómo Jugar

1. **Login**: Iniciar con Google OAuth
2. **Crear Pet**: Elegir nombre y especie
3. **Cuidar**: Feed, Play, Sleep, Pet
4. **Evolucionar**: Verlo crecer día a día
5. **Competir**: Ver leaderboard global

## 📊 Datos de Producción

### Tamaño
- ~5000 líneas de TypeScript
- ~1500 líneas de CSS
- ~500 líneas SQL (schema)

### Performance
- Game loop: 60s (no cada frame)
- Snapshots: cada 5 minutos
- Rendering: Canvas optimizado
- Signals: Reactividad eficiente

### Seguridad
- OAuth 2.0 (Google)
- RLS policies (Supabase)
- HTTPS (Vercel)
- Validación client + server

## 🤝 Contribución

Built with ❤️ by:
- **Developer**: alessutem
- **AI Assistant**: Copilot
- **Framework**: Angular 17
- **Database**: Supabase

---

**Version**: 0.1.0  
**Status**: MVP Ready for Testing  
**Last Updated**: 2026-03-26  
**Next Phase**: FASE 7 (Testing + Deploy)
