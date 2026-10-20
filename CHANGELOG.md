# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Nothing yet.

## [1.0.0] — 2026-10-21

### Added
- **10 mini-games** across three categories — Pick one, Last place, Teams & pairs:
  Wheel of Goodbye, Plinko of Fate, Lucky Slots, Hot Bomb, Snail Race,
  Skull Card, Hammer of Fate, Team Machine, Gacha Teams, Pair Machine.
- Procedurally generated Three.js world: characters, mascots (rabbit, bird,
  duck, cat, butterfly), scenery, meadow, mountains, pond and campsite.
- Animated ambient background scene on every page.
- **8 languages** with browser auto-detection, manual switcher and per-key
  English fallback: English, Tiếng Việt, 中文, 日本語, 한국어, Español, Français,
  Português.
- Player roster of 2–24 people with color-coded 3D avatars, editable in a
  drawer and persisted in `localStorage`.
- Procedural sound effects (Web Audio API) with a global mute toggle.
- Installable **PWA**: web app manifest, generated icon set, service worker with
  precache + runtime caching, fully playable offline.
- Responsive layout verified on mobile, tablet and desktop viewports.
- Hash-based routing so the app works on any static host or sub-path.
- Automated deployment to GitHub Pages, plus a `npm run deploy:pages` script
  for manual releases.
- Repository hardening: README, MIT license, contributing guide, code of
  conduct, security policy, issue and pull-request templates, CI workflow,
  Dependabot and branch protection.

[Unreleased]: https://github.com/sondv5/bet-arcade/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/sondv5/bet-arcade/releases/tag/v1.0.0
