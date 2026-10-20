# BÉT! — mini-game contract

Read this before writing a game. Also read `src/games/demo/DemoGame.jsx`, `src/lib/threeKit.js`, `src/lib/useStage.js`, `src/lib/sfx.js`.

## Ownership

- Write ONLY inside your assigned game folder (`src/games/<slug>/`): main JSX, an optional scoped CSS file, and optional small helpers in that folder.
- Do NOT edit `package.json`, `vite.config.js`, `src/data/games.js`, shared components, shared CSS, `src/lib/**`, or another game's folder.
- No new npm dependencies, no external images/fonts/network calls. Everything 3D is generated in code.

## Props

```jsx
<MyGame players={players} onFinish={onFinish} />
```

- `players`: stable array of `{ id, name, color }`. `color` is a hex string. Between 2 and the game's max (see `src/data/games.js`). Player names are Vietnamese and can contain diacritics.
- `onFinish(result)`: call exactly once per round, after the outcome animation finishes. The shell renders the result modal and can replay by remounting the component.

```js
// one or several chosen people (winner, loser, "the chosen one", bottom N…)
{ type: 'players', playerIds: ['id1', 'id2'], headline: 'Kẻ về bét', tone: 'lose' }
// tone: 'pick' | 'win' | 'lose' (visual only)

// teams / pairs
{
  type: 'teams',
  headline: 'Đội hình chốt sổ', // optional
  groups: [
    { name: 'Đội Đỏ', playerIds: ['id1', 'id2'] },
    { name: 'Đội Xanh', playerIds: ['id3', 'id4'] },
  ]
}
```

Keep result IDs to players that exist. Never call `onFinish` while the player list is empty. Avoid calling it twice (guard with a ref).

## Stage + three.js

Use the shared hook:

```jsx
const hostRef = useRef(null)
const api = useStage(hostRef, {
  fov: 36,
  position: [0, 7, 12],
  lookAt: [0, 1, 0],
  setup: (stage) => {
    // add meshes, subscribe to stage.onFrame(...) / stage.onResize(...)
    return { spin } // exposed at api.current.spin
  },
})
```

`useStage` creates renderer, camera, lights, soft shadow catcher and disposes everything on unmount. Build all scene objects in `setup` so they are cleaned up. Use `stage.onFrame((dt, elapsed) => …)` for animation. NEVER create a second renderer or an animation loop outside the stage callbacks.

Useful helpers from `src/lib/threeKit.js`:

- `makeBlock({ width, height, depth, color, radius, ... })` — rounded toy block with shadows.
- `makePlayerBlock(player, { size, labelHeight })` — colored cube + name label above.
- `makeTextSprite(text, { height, color, background, border, ... })` / `makeTextPlane(...)` — crisp Vietnamese text, no texture files.
- `addContactRing(scene, …)` — subtle ring on the floor.
- easing: `easeOutCubic`, `easeInOutCubic`, `easeOutQuint`, `easeOutBack`, `easeOutBounce`.
- `PALETTE`, `INK`, `CREAM`, `clamp`, `lerp`.

Use `randomInt`, `shuffle`, `sample`, `pickRandom` from `src/lib/random.js` for outcomes (crypto-backed). Math.random is fine for visual jitter only.

Camera must look good on phone portrait and desktop. Use `stage.onResize(({ aspect }) => stage.setCamera(...))` to widen/pull back on narrow screens. Test at ~390×844 and ~1440×900. Everything interactive must be tap-friendly (44px+).

Sound: import `{ sfx }` and use `sfx.click/tick/pop/whoosh/spin/boom/win/lose/gong/drumroll/coin/beep`. Sound is muted globally by the shell, so call freely.

## UI

The game fills `div.game-root` (absolute, full stage). Your component returns:

```jsx
<div className="game-root">
  <div className="game-canvas" ref={hostRef} />
  <div className="game-hud">
    <div className="stage-note">Short instruction, max 2 lines.</div>
    <div className="stage-controls">
      <button className="btn btn-primary">…</button>
    </div>
  </div>
</div>
```

`game-hud` is click-through except its children. Use these shared classes where possible:

- `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-small`, `.btn[disabled]`
- `.stage-controls` (bottom-center dock), `.stage-note` (small floating hint)
- `.hud-card` (cream card on stage), `.hud-kicker` (tiny uppercase label)
- `.seg` + `.seg button` for segmented choices (settings)
- `.chip` for small pills
- `.game-settings` (top-left settings cluster)
- `.game-readout` (top-right small status)
- Prefix any custom CSS with your game slug (`.wheel-…`) and import the CSS from your JSX.

Copy is Vietnamese, playful, short, "bựa" but friendly. No slurs, no real gambling mechanics, no drinking pressure. Say "phạt" (forfeit), not alcohol.

After the outcome, keep the final scene visible on screen. The shell handles the result modal. Disable replay/buttons appropriately; don't auto-navigate.

## Rules

- Exactly one outcome per round, fair (uniform random among candidates unless the game explicitly shows stakes).
- The game must be playable with the minimum of 2 players, and handle up to its max without labels colliding catastrophically. Scale blocks/labels down when there are many players.
- Clean up `setTimeout`/`setInterval` in a `useEffect` cleanup. Do not use timeouts longer than needed.
- Respect `prefers-reduced-motion`: shorten/lower-motion flourishes where practical (optional but nice).
- No `Math.random()` for the actual winner/loser; use the shared random helpers.
- Verify with `npx vite build --outDir .tmp-<slug>` and remove `.tmp-<slug>` afterwards. Do not run `npm run dev` on a port if one is already in use; do not edit global files to fix a local error.
- Final reply: list files created, controls, result shapes, sound used, and any known caveats. Keep it short.
