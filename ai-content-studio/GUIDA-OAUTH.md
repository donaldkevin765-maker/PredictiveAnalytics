# Guida Registrazione App OAuth

## 1. YouTube (Google Cloud Console)

**Tempo: ~10 minuti**

1. Vai su https://console.cloud.google.com/
2. Crea progetto → nome: **AI Content Studio**
3. API & Services → Libreria → cerca **YouTube Data API v3** → **Abilita**
4. API & Services → **OAuth consent screen**
   - User Type: **Extern**
   - App name: `AI Content Studio`
   - User support email: la tua email
   - Developer contact: la tua email
   - Save
5. **Scopes**: Add or Remove Scopes → seleziona:
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/youtube.readonly`
   - Update → Save
6. **Test users**: Add Users → aggiungi la tua email
   - Back to Dashboard
7. **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `AI Studio Web`
   - **Authorized redirect URIs** (copia esatto):
     ```
     https://sistema-video-ai.vercel.app/api/v1/social/callback/youtube
     http://localhost:8000/api/v1/social/callback/youtube
     ```
   - **Authorized JavaScript origins**:
     ```
     https://web-three-swart-54.vercel.app
     http://localhost:3000
     ```
   - **Create**
8. Copia **Client ID** e **Client Secret**

---

## 2. Instagram (Meta for Developers)

**Serve una pagina Facebook. Tempo: ~15 minuti**

1. Vai su https://developers.facebook.com/
2. **My Apps** → **Create App**
   - App type: **Business**
   - App name: `AI Content Studio`
   - Contact email: la tua
   - **Create App**
3. **Dashboard** → **Add Product** → **Instagram Graph API** → **Set Up**
4. **Tools** → **Graph API Explorer**
   - App: AI Content Studio
   - User or Page: **User Token**
   - Permissions: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`
   - **Generate Token**
5. **Settings** → **Basic**
   - **App Domains**: `https://web-three-swart-54.vercel.app`
   - **Privacy Policy URL**: `https://web-three-swart-54.vercel.app` (o un URL vero)
   - **Category**: scegli una
   - **Valid OAuth Redirect URIs** (copia esatto):
     ```
     https://sistema-video-ai.vercel.app/api/v1/social/callback/instagram
     http://localhost:8000/api/v1/social/callback/instagram
     ```
   - Save Changes
6. Copia **App ID** (client_id) e **App Secret** (client_secret)

---

## 3. TikTok

**Tempo: ~10 minuti**

1. Vai su https://developers.tiktok.com/
2. **My Apps** → **Create App**
   - Name: `AI Content Studio`
   - Description: `Dashboard per pubblicazione video AI`
3. **Add Capabilities**:
   - **Login Kit** → permissions: `user.info.basic`
   - **Video Kit** → permissions: `video.upload`, `video.publish`
4. **Platform**: **Web**
   - **Domain**: `web-three-swart-54.vercel.app`
   - **Redirect URLs** (copia esatto):
     ```
     https://sistema-video-ai.vercel.app/api/v1/social/callback/tiktok
     http://localhost:8000/api/v1/social/callback/tiktok
     ```
5. Copia **Client Key** e **Client Secret**

---

## Dopo aver ottenuto le credenziali

Configurarle su Vercel in 2 minuti:

```bash
cd sistema-video-ai-automatico

vercel env add YOUTUBE_CLIENT_ID production
# Incolla il valore

vercel env add YOUTUBE_CLIENT_SECRET production
# Incolla il valore

vercel env add INSTAGRAM_CLIENT_ID production
# Incolla il valore

vercel env add INSTAGRAM_CLIENT_SECRET production
# Incolla il valore

vercel env add TIKTOK_CLIENT_KEY production
# Incolla il valore

vercel env add TIKTOK_CLIENT_SECRET production
# Incolla il valore

vercel env add SOCIAL_CALLBACK_BASE production
# Valore: https://sistema-video-ai.vercel.app

# Poi ridistribuisci
vercel --prod
```

Oppure fammi una lista con le credenziali e le configuro e deployo io in automatico.
