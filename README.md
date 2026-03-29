# Sports Reality Engine

An AI-powered NBA cinematic experience generator. Pick a live game, select a play, and watch the app generate a full multimedia production — storyboard image, AI commentary, hype soundtrack, and cinematic video — all powered by Google Gemini.

## What It Does

1. **Select a game** — Live NBA scoreboard pulled from the ESPN public API
2. **Pick a play** — Notable plays (dunks, blocks, steals, scoring plays) filtered from the game feed
3. **Generate** — A multi-step AI pipeline runs in parallel:
   - **Director Brain** (Gemini 2.5 Flash) — Analyzes the play and produces a scene description, video prompt, music mood, and broadcaster commentary script
   - **Storyboard** (Gemini 2.5 Flash image) — Generates a cinematic still of the moment
   - **Commentary** (Gemini TTS) — Reads the commentary script aloud in a broadcaster voice
   - **Soundtrack** (Lyria 3) — Composes mood-matched hype music
   - **Cinematic Video** (Veo 2) — Generates an 8-second slow-motion clip
4. **What If?** — After generation, reimagine the play with an alternate-reality prompt (video/music skipped for speed; storyboard + commentary regenerated)

## Architecture

```
SportsRealityEngine/
├── server/                    # Express API server (Node.js, ESM)
│   ├── index.js               # App entry, CORS, routes mount
│   ├── routes/
│   │   ├── games.js           # GET /api/games, GET /api/games/:id/plays
│   │   └── generate.js        # POST /api/generate (SSE stream)
│   ├── services/
│   │   ├── director.js        # Gemini 2.5 Flash — scene JSON
│   │   ├── nanoBanana.js      # Gemini image generation — storyboard
│   │   ├── tts.js             # Gemini TTS — commentary WAV
│   │   ├── lyria.js           # Lyria 3 — background music
│   │   ├── veo.js             # Veo 2 — long-running video generation
│   │   ├── pipeline.js        # Orchestrates all services, emits SSE events
│   │   └── espn.js            # ESPN public API wrapper
│   └── utils/
│       └── pcmToWav.js        # Converts raw PCM audio to WAV
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx            # Root component, view state machine
│   │   ├── components/
│   │   │   ├── GameSelector.jsx       # Live game grid
│   │   │   ├── PlaySelector.jsx       # Filterable play list
│   │   │   ├── GenerationExperience.jsx # Results view
│   │   │   ├── LoadingSteps.jsx       # Pipeline progress UI
│   │   │   ├── AudioPlayer.jsx        # Audio playback widget
│   │   │   └── WhatIfInput.jsx        # Alternate-reality prompt input
│   │   ├── hooks/
│   │   │   └── useSSE.js      # Reads SSE stream, manages result state
│   │   └── services/
│   │       └── api.js         # fetch wrappers for all server routes
│   └── ...config files
└── package.json               # Root workspace — runs server + client concurrently
```

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express 4 (ESM) |
| AI — Scene/Story | Gemini 2.5 Flash |
| AI — Image | Gemini 2.5 Flash Preview Image |
| AI — TTS | Gemini 2.5 Flash TTS (`Fenrir` voice) |
| AI — Music | Lyria 3 Clip |
| AI — Video | Veo 2.0 (long-running operation, polls up to 2 min) |
| Sports Data | ESPN public scoreboard + summary API |
| Streaming | Server-Sent Events (SSE) |

## Setup

### Prerequisites
- Node.js 18+
- A Google Gemini API key with access to Veo 2 and Lyria 3 preview models

### Install

```bash
# Root dependencies (concurrently)
npm install

# Server dependencies
cd server && npm install && cd ..

# Client dependencies
cd client && npm install && cd ..
```

### Environment

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

### Run

```bash
npm run dev
```

This starts both the Express server (`localhost:3001`) and the Vite dev server (`localhost:5173`) concurrently.

Open `http://localhost:5173`.

## SSE Event Protocol

The `POST /api/generate` endpoint streams Server-Sent Events:

| Event | Payload | Description |
|---|---|---|
| `status` | `{ step, state }` | Step progress: `loading` → `done` \| `error` |
| `director` | `{ scene }` | Scene JSON from Director Brain |
| `storyboard` | `{ imageDataUrl }` | Base64 image |
| `commentary` | `{ audioDataUrl }` | Base64 WAV |
| `music` | `{ audioDataUrl }` | Base64 audio |
| `video` | `{ videoDataUrl }` | Base64 MP4 |
| `video_timeout` | `{ message }` | Veo timed out — storyboard shown instead |
| `complete` | `{}` | All steps finished |
| `error` | `{ message }` | Pipeline-level error |

## What If Mode

After a generation completes, the **What If?** panel lets users rewrite history. Enter a scenario (e.g. "What if the defender had blocked the shot?") and the Director Brain receives the altered prompt. Only storyboard + commentary are regenerated (Veo and Lyria are skipped for speed).
