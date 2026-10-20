const STROKE = {
  stroke: '#17161a',
  strokeWidth: 3.2,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
}

function Wheel() {
  return (
    <g {...STROKE}>
      <circle cx="32" cy="35" r="20" fill="#fffaf1" />
      <path d="M32 35V15a20 20 0 0 1 17.3 10Z" fill="#ff4d6d" />
      <path d="M32 35l17.3-10a20 20 0 0 1 0 20Z" fill="#ffd23f" />
      <path d="M32 35l17.3 10A20 20 0 0 1 32 55Z" fill="#2ee6a6" />
      <path d="M32 35v20a20 20 0 0 1-17.3-10Z" fill="#4d9bff" />
      <path d="M32 35L14.7 45a20 20 0 0 1 0-20Z" fill="#9b7bff" />
      <path d="M32 35L14.7 25A20 20 0 0 1 32 15Z" fill="#ff6fb5" />
      <circle cx="32" cy="35" r="20" fill="none" />
      <circle cx="32" cy="35" r="4.5" fill="#17161a" />
      <path d="M32 5l7 10H25Z" fill="#17161a" />
      <path d="M32 56v3" />
    </g>
  )
}

function Plinko() {
  return (
    <g {...STROKE}>
      <rect x="14" y="6" width="36" height="52" rx="8" fill="#fffaf1" />
      <circle cx="32" cy="14" r="4.5" fill="#ffd23f" />
      {[22, 32, 42].map((x) => (
        <circle key={`a${x}`} cx={x} cy="24" r="2.2" fill="#17161a" stroke="none" />
      ))}
      {[27, 37].map((x) => (
        <circle key={`b${x}`} cx={x} cy="32" r="2.2" fill="#17161a" stroke="none" />
      ))}
      {[22, 32, 42].map((x) => (
        <circle key={`c${x}`} cx={x} cy="40" r="2.2" fill="#17161a" stroke="none" />
      ))}
      <path d="M20 47h24" />
      <path d="M20 47v7M32 47v7M44 47v7" />
      <path d="M20 54h8v-7M36 47h8v7" fill="#4d9bff" opacity=".55" />
    </g>
  )
}

function Slots() {
  return (
    <g {...STROKE}>
      <rect x="7" y="13" width="43" height="35" rx="8" fill="#fffaf1" />
      <rect x="13" y="19" width="31" height="23" rx="5" fill="#f1e7d8" />
      <path d="M23.5 19v23M33.5 19v23" />
      <circle cx="18.5" cy="30.5" r="3.4" fill="#ff4d6d" stroke="none" />
      <path d="M29 26l4 4.5-4 4.5-4-4.5Z" fill="#2ee6a6" stroke="none" />
      <path d="M40 31l2 4 4 .6-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.6Z" fill="#ffd23f" stroke="none" />
      <path d="M50 21h5l2-8" />
      <circle cx="58" cy="11" r="4" fill="#ff4d6d" />
      <path d="M7 52h43" />
      <path d="M13 48v4M45 48v4" />
    </g>
  )
}

function Bomb() {
  return (
    <g {...STROKE}>
      <circle cx="29" cy="37" r="17" fill="#17161a" />
      <path d="M35 22c3-6 8-5 10-11" stroke="#ff4d6d" strokeWidth="4.5" />
      <path d="M46 5l1.4 4.2L52 10l-4.2 1.4L46 16l-1.4-4.6L40 10l4.2-.8Z" fill="#ffd23f" />
      <path d="M20 30l4-5" stroke="#fffaf1" strokeWidth="3" opacity=".75" />
      <path d="M21 46c3 4 8 6 12 5" stroke="#fffaf1" strokeWidth="2.4" opacity=".28" />
    </g>
  )
}

function Snail() {
  return (
    <g {...STROKE}>
      <path d="M8 47h38c6 0 9-3 9-7s-3-6-7-6" fill="#ff4d6d" />
      <path d="M10 47v5h36" fill="#ff4d6d" />
      <circle cx="34" cy="30" r="14" fill="#fffaf1" />
      <path d="M34 30c0-4 6-4 6 0 0 6-9 7-11 1-3-8 7-14 13-10 8 5 6 17-3 21" fill="none" />
      <path d="M22 27l-3-9M27 25l2-9" />
      <circle cx="18.5" cy="17" r="2.4" fill="#17161a" stroke="none" />
      <circle cx="29.5" cy="15" r="2.4" fill="#17161a" stroke="none" />
      <path d="M6 56h8M18 59h5" opacity=".4" />
    </g>
  )
}

function Cards() {
  return (
    <g {...STROKE}>
      <g transform="rotate(-11 26 34)">
        <rect x="11" y="15" width="25" height="35" rx="4.5" fill="#e7d6ff" />
        <circle cx="23.5" cy="29" r="6.5" fill="#fffaf1" />
        <path d="M20 27.5h.1M27 27.5h.1" strokeWidth="4" />
        <path d="M21 35h5" />
        <path d="M23.5 22l1-3.5 1 3.5" fill="#9b7bff" />
      </g>
      <g transform="rotate(9 39 34)">
        <rect x="30" y="14" width="25" height="36" rx="4.5" fill="#fffaf1" />
        <path d="M42.5 23c-6 0-9 4-9 9 0 4 2 6 4 7v4h10v-4c2-1 4-3 4-7 0-5-3-9-9-9Z" fill="#17161a" />
        <circle cx="39.5" cy="32" r="2.2" fill="#fffaf1" stroke="none" />
        <circle cx="45.5" cy="32" r="2.2" fill="#fffaf1" stroke="none" />
        <path d="M40.5 43v-5M44.5 43v-5" />
        <path d="M37.5 43h10" />
      </g>
    </g>
  )
}

function Hammer() {
  return (
    <g {...STROKE}>
      <path d="M17 55L41 27" strokeWidth="5" />
      <g transform="rotate(-42 43 19)">
        <rect x="31" y="10" width="28" height="16" rx="4" fill="#fffaf1" />
        <rect x="50" y="10" width="9" height="16" rx="3" fill="#ff9f43" />
      </g>
      <path d="M52 43l2 7M58 39l5 3M47 38v-5" stroke="#ff9f43" strokeWidth="3.6" />
      <circle cx="18" cy="55" r="3" fill="#17161a" stroke="none" />
    </g>
  )
}

function Teams() {
  return (
    <g {...STROKE}>
      <path d="M7 37h14l3 17H4Z" fill="#fffaf1" />
      <path d="M25 37h14l3 17H22Z" fill="#fffaf1" />
      <path d="M43 37h14l3 17H40Z" fill="#fffaf1" />
      <rect x="10" y="41" width="7" height="7" rx="1.6" fill="#ff4d6d" stroke="none" />
      <rect x="28" y="41" width="7" height="7" rx="1.6" fill="#ffd23f" stroke="none" />
      <rect x="46" y="41" width="7" height="7" rx="1.6" fill="#2ee6a6" stroke="none" />
      <rect x="12" y="17" width="8" height="8" rx="2" fill="#4d9bff" transform="rotate(-8 16 21)" />
      <rect x="30" y="10" width="8" height="8" rx="2" fill="#9b7bff" transform="rotate(7 34 14)" />
      <rect x="48" y="18" width="8" height="8" rx="2" fill="#ff6fb5" transform="rotate(-6 52 22)" />
      <path d="M16 27v6M34 20v6M52 28v5" opacity=".55" />
    </g>
  )
}

function Gacha() {
  return (
    <g {...STROKE}>
      <path d="M12 30a20 20 0 0 1 40 0v4H12Z" fill="#fffaf1" />
      <circle cx="24" cy="25" r="5" fill="#ff4d6d" stroke="none" />
      <circle cx="36" cy="19" r="4.2" fill="#4d9bff" stroke="none" />
      <circle cx="42" cy="29" r="4.5" fill="#2ee6a6" stroke="none" />
      <circle cx="31" cy="30" r="4" fill="#ffd23f" stroke="none" />
      <path d="M12 34h40l-4 9H16Z" fill="#fffaf1" />
      <path d="M16 43h32l-3 12H19Z" fill="#ffe1e9" />
      <rect x="25" y="46" width="15" height="9" rx="3" fill="#17161a" />
      <circle cx="45" cy="39" r="3.5" fill="#ffd23f" />
      <path d="M31 21v-4" opacity=".4" />
    </g>
  )
}

function Pairs() {
  return (
    <g {...STROKE}>
      <g transform="rotate(-8 22 26)">
        <rect x="8" y="12" width="22" height="22" rx="6" fill="#ff4d6d" />
        <circle cx="19" cy="23" r="4.5" fill="#fffaf1" stroke="none" />
      </g>
      <g transform="rotate(8 43 38)">
        <rect x="34" y="28" width="22" height="22" rx="6" fill="#4d9bff" />
        <path d="M45 33v6a6 6 0 0 0 6 6" fill="none" stroke="#fffaf1" />
        <circle cx="45" cy="33" r="2.4" fill="#fffaf1" stroke="none" />
      </g>
      <path d="M28 30c7 2 8 6 10 10" strokeDasharray="2 5" />
      <circle cx="38" cy="18" r="3.5" fill="#fffaf1" />
      <path d="M36 18h4M38 16v4" />
    </g>
  )
}

const GAME_ICON_MAP = {
  wheel: Wheel,
  plinko: Plinko,
  slots: Slots,
  bomb: Bomb,
  snail: Snail,
  cards: Cards,
  hammer: Hammer,
  teams: Teams,
  gacha: Gacha,
  pairs: Pairs,
}

export function GameIcon({ id, className = '' }) {
  const Shape = GAME_ICON_MAP[id] ?? Wheel
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
      <Shape />
    </svg>
  )
}

const UI_PATHS = {
  back: <path d="M10 5L3 12l7 7M3 12h18" />,
  arrowRight: <path d="M4 12h16M14 6l6 6-6 6" />,
  arrowDown: <path d="M12 4v16M6 14l6 6 6-6" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 21v-2a6 6 0 0 1 6-6h.5a6 6 0 0 1 6 6v2" />
      <path d="M15.5 5.4a3.2 3.2 0 0 1 0 5.2M17 13.6a6 6 0 0 1 4 5.4v2" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9h4l5-4v14l-5-4H4Z" fill="currentColor" stroke="none" />
      <path d="M16 8.5a5 5 0 0 1 0 7M19 6a9 9 0 0 1 0 12" />
    </>
  ),
  volumeOff: (
    <>
      <path d="M4 9h4l5-4v14l-5-4H4Z" fill="currentColor" stroke="none" />
      <path d="M16 9l5 6M21 9l-5 6" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="13" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </>
  ),
  shuffle: (
    <>
      <path d="M3 6h3c5 0 6 12 11 12h4M3 18h3c2.5 0 4-3 5.3-6" />
      <path d="M17 3l4 3-4 3M17 15l4 3-4 3" />
    </>
  ),
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />,
  check: <path d="M4 12l5 5L20 6" />,
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M4 18v2h16v-2" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8Z" />
    </>
  ),
  crown: <path d="M3 8l4 3 5-7 5 7 4-3-2 11H5Z" />,
  skull: (
    <>
      <path d="M5 11a7 7 0 0 1 14 0c0 3-1.5 4.5-3 5.5V20H8v-3.5C6.5 15.5 5 14 5 11Z" />
      <circle cx="9" cy="11" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1.3" fill="currentColor" stroke="none" />
      <path d="M10 20v-2M14 20v-2" />
    </>
  ),
  star: <path d="M12 3l2.6 6.1 6.4.6-4.9 4.3 1.5 6.4L12 16.8 6.4 20.4 7.9 14 3 9.7l6.4-.6Z" />,
  chevronDown: <path d="M5 9l7 7 7-7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" />
    </>
  ),
  dice: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
}

export function UiIcon({ name, size = 20, className = '', strokeWidth = 2 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {UI_PATHS[name] ?? UI_PATHS.sparkle}
    </svg>
  )
}
