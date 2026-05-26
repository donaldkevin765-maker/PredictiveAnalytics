# Predictive Analytics - AlphaOS

## Progetto Scolastico - Kevin Donald

### Come avviare il progetto

**Opzione 1 - Server Python (consigliato):**
```bash
cd /Users/kevindonald/Desktop/PredictiveAnalytics
python3 -m http.server 8080
```
Poi apri: http://localhost:8080

**Opzione 2 - Server Node.js:**
```bash
npx serve .
```

**Opzione 3 - Live Server (VS Code):**
Clicca destro su index.html > "Open with Live Server"

### Accesso da altri dispositivi (stessa rete WiFi)

1. Trova il tuo IP locale: `ifconfig | grep "inet "`
2. Gli altri dispositivi devono aprire: `http://TUO_IP:8080`

### QR Code

- Nell'app c'e un pulsante "QR Code Mobile" nella sidebar
- Scansiona per aprire l'app dal telefono

### Feature Implementate (10/10)

1. Neural Network Animation - Rete neurale animata durante le analisi
2. Live Market Data - Dati crypto reali da CoinGecko API
3. Voice Commands - Controllo vocale dell'interfaccia
4. 3D Data Globe - Globo Three.js con particelle
5. QR Code Generator - QR dinamico per accesso mobile
6. PDF Report Export - Esporta analisi in PDF
7. Real-time Toast Alerts - Notifiche in tempo reale
8. Interactive Timeline - Timeline proiezioni future
9. PWA Support - Installabile come app
10. Particle Background - Sistema particellare interattivo

### Struttura File

```
PredictiveAnalytics/
├── index.html          # App principale
├── manifest.json       # PWA manifest
├── sw.js               # Service worker
├── README.md           # Questo file
├── avatar.gemin.mp4    # Video (opzionale)
└── WhatsApp Image...   # Foto profilo (opzionale)
```

### API Key (opzionale)

Per le funzionalita AI avanzate, inserisci una Google Gemini API Key nelle Impostazioni.
