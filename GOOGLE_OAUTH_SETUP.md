# 🔐 Configuración Google OAuth en Supabase

## Paso 1: Crear Proyecto en Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Crea un nuevo proyecto llamado "Pixel Pet"
3. Habilita Google+ API:
   - Ve a "APIs & Services" → "Enabled APIs & services"
   - Click "Enable APIs and Services"
   - Busca "Google+ API"
   - Click "Enable"

## Paso 2: Crear Credenciales OAuth

1. Ve a "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Si pide, primero configura "OAuth consent screen":
   - Type: External
   - App name: Pixel Pet
   - User support email: tu email
   - Developer contact: tu email
   - Click Save and Continue
4. En Credentials, selecciona "Web application"
5. Nombre: "Pixel Pet Web"
6. URIs autorizados (Authorized redirect URIs):
   ```
   https://lhloplukxgozyrveiqfd.supabase.co/auth/v1/callback
   http://localhost:3000/auth/v1/callback
   http://localhost:4200/auth/v1/callback
   ```
7. Click "Create"
8. Copia:
   - **Client ID**
   - **Client Secret**

## Paso 3: Configurar en Supabase

1. Ve a tu proyecto Supabase
2. Settings → Authentication → Providers
3. Busca "Google"
4. Click para habilitarlo
5. Pega:
   - **Client ID** (del paso anterior)
   - **Client Secret** (del paso anterior)
6. Click "Save"

## Paso 4: Verificar Redirect URL

1. En Supabase: Settings → Authentication
2. Copia la URL de "Authorized redirect URLs"
3. Vuelve a Google Cloud Console
4. Credentials → edita tu OAuth client
5. Añade la URL de Supabase a "Authorized redirect URIs"

## ✅ Listo!

Google OAuth está configurado. El LoginComponent ya maneja todo automáticamente.

### URLs de prueba:
- Local dev: http://localhost:4200
- Dashboard redirect: http://localhost:4200/dashboard
