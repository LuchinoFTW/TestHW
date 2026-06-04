# Quiz Topolino — Deploy su Netlify

## Prerequisiti
- Account [Netlify](https://netlify.com) (gratuito)
- Account [Anthropic](https://console.anthropic.com) per la API key
- Node.js installato sul tuo computer

## Deploy in 5 passi

### 1. Carica il progetto su GitHub
Crea un repository GitHub e carica tutti i file del progetto.

### 2. Collega Netlify a GitHub
- Vai su [app.netlify.com](https://app.netlify.com)
- Clicca "Add new site" → "Import an existing project"
- Seleziona il tuo repository GitHub

### 3. Configura il build
Netlify rileverà automaticamente le impostazioni da `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`

### 4. Aggiungi la variabile d'ambiente
- Vai su **Site settings → Environment variables**
- Aggiungi:
  - Key: `ANTHROPIC_API_KEY`
  - Value: la tua API key di Anthropic (la trovi su console.anthropic.com)

### 5. Deploy
Clicca "Deploy site". Netlify farà tutto automaticamente.

## Sviluppo locale
```bash
npm install
npm run dev
```
Per testare le Netlify Functions in locale:
```bash
npm install -g netlify-cli
netlify dev
```

## Personalizzazione
Per cambiare le domande e i profili, modifica `src/App.jsx`:
- `ASPECTS` — i 3 (o più) aspetti con label, emoji e descrizione
- `PROFILES` — i profili risultato con nome, emoji e condizione di attivazione
- Il prompt AI nella Netlify Function `netlify/functions/generate-profile.js`
