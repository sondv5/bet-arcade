## 🎲 BÉT! v1.0.0 — First public release

A tiny 3D world of party games. Ten mini-games to pick a person, find the last-place loser, or split the team. No arguments, last is last.

**Live:** https://sondv5.github.io/bet-arcade/

### ✨ Highlights

- **10 mini-games** in three categories — pick one, find the last place, teams & pairs
- **Fully 3D scenes** built procedurally with Three.js — characters, mascots, scenery, no external 3D assets
- **Installable PWA** — offline-ready, works on phones, tablets and desktops
- **8 languages** — English, Tiếng Việt, 中文, 日本語, 한국어, Español, Français, Português
- **Procedural sound effects** via the Web Audio API, with a global mute toggle
- **2–24 players** with color-coded 3D avatars, stored locally
- **Responsive** — mobile-first layout, verified across viewports

### 🕹️ The games

| Game | Category | Players |
| :--- | :--- | :--- |
| Wheel of Goodbye | Pick one | 2–24 |
| Plinko of Fate | Pick one | 2–12 |
| Lucky Slots | Pick one | 2–12 |
| Hot Bomb | Last place | 2–24 |
| Snail Race | Last place | 2–24 |
| Skull Card | Last place | 2–12 |
| Hammer of Fate | Last place | 2–24 |
| Team Machine | Teams | 2–24 |
| Gacha Teams | Teams | 2–24 |
| Pair Machine | Teams | 2–24 |

### 🔧 Under the hood

- React 19 + Vite 8 + Three.js r186, zero runtime dependencies beyond those
- Hash-based routing — deploys to any static host or sub-path
- Web App Manifest + service worker (precache + runtime cache) for offline play
- Automated CI and GitHub Pages deployment via GitHub Actions
- Dependabot, issue/PR templates, and a full community health file set

### 📄 License

MIT © 2026 sondv5
