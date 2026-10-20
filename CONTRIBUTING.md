# Contributing to BÉT! 🎲

Thanks for taking the time to contribute! This is a small, friendly project and
all help is appreciated — code, translations, screenshots, bug reports.

## 📋 Before you start

- **Search existing issues** — the bug may already be reported.
- **Open an issue first** for anything larger than a bug fix. A short discussion
  avoids duplicated work and keeps the design consistent.
- For bugs, use the **Bug report** template and include the browser, device and
  the exact steps to reproduce.

## 🛠 Local setup

```bash
git clone https://github.com/sondv5/bet-arcade.git
cd bet-arcade
npm install
npm run dev
```

Requirements: **Node.js 20+** and **npm 10+**.

| Command | Description |
| :--- | :--- |
| `npm run dev` | Dev server with hot reload on <http://localhost:5173> |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run icons` | Regenerate the PWA icon set |
| `npm run deploy:pages` | Build and publish to the `gh-pages` branch |

## 🌱 Branching

- Branch from `main`: `git checkout -b feature/my-change`.
- Use clear commit messages, e.g. `feat: add gacha capsule bounce`,
  `fix: pairs trio label on 5 players`.
- Keep pull requests focused — one logical change per PR.

## ✅ Pull request checklist

- [ ] `npm run build` completes without errors
- [ ] The change was tested in the browser (desktop **and** mobile viewport)
- [ ] New UI strings exist in **all** locale files under `src/i18n/locales/`
- [ ] No console errors and no `TODO` comments left behind
- [ ] Screenshots added for visual changes

## 🎮 Adding a mini-game

Each game lives in `src/games/<game-id>/` and follows the contract documented in
[`src/games/GAME_CONTRACT.md`](src/games/GAME_CONTRACT.md). Register it in
`src/data/games.js` with an id, category, player limits and an accent color.

Rules of thumb:

- Build the scene procedurally with the helpers in `src/lib/threeKit.js` and
  `src/lib/characters.js` — the project ships **no external 3D assets**.
- Always honour the player's colour palette so avatars stay recognizable.
- Play sound through `src/lib/sfx.js` so the global mute toggle keeps working.
- Respect `prefers-reduced-motion` where it is cheap to do so.

## 🌍 Translations

1. Copy `src/i18n/locales/en.js` → `src/i18n/locales/<code>.js`.
2. Translate the values (keep the keys untouched).
3. Register the locale in `src/i18n/index.jsx`.
4. Open a PR — missing keys gracefully fall back to English.

## 💬 Code of conduct

By participating you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

Contributions are licensed under the [MIT License](LICENSE).
