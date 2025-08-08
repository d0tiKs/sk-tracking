# 📓💀👑 Skull King Tracker — Progressive Web App

A **lightweight, offline-first** score tracker for the **Skull King** card game.  
Built with **React + TypeScript + Vite + Tailwind CSS**, it lets you **record bids, results, and special cards**, calculate scores automatically (based on bids/tricks/bonus), and export your games — all in a **mobile-friendly PWA** you can install and use without internet.

**Live App:** [d0tiks.github.io/sk-tracking](https://d0tiks.github.io/sk-tracking)  
**Source Code:** [github.com/d0tiKs/sk-tracking](https://github.com/d0tiKs/sk-tracking)

---

## ✨ Features

- **Full game flow**: New Game → Bets → Results → Summary
- **Automatic score calculation** for bids/tricks/bonus
- **Live projected score** while entering results
- **Harry adjustment mechanic** (±2 bid tweak)
- **Special card tracking** (Skull King, Second, Pirates, Mermaids, Coins) — *tracked only, no auto-scoring*
- **Per-round cumulative score tracking**
- **Editable past rounds** (unlock feature)
- **Offline-first** — works without internet (IndexedDB + PWA)
- **CSV & Excel export** with all game details
- **Mobile-friendly UI** with collapsible sections
- **Duplicate name prevention** in player setup
- **Randomized player order** with inline preview and confirmation before game start — improves mobile usability by replacing a modal with a streamlined inline preview, ensuring a smoother user experience during game setup.

---

## 📸 Screenshots

*(Add screenshots or GIFs here — New Game, Bets, Results, Summary)*

---

## 🎮 Quick Start (Players)

1. **Open the app**: [d0tiks.github.io/sk-tracking](https://d0tiks.github.io/sk-tracking)
2. **Install it** (optional):
   - On mobile: “Add to Home Screen” from your browser menu
   - On desktop: Install via browser’s PWA prompt
3. **Start a new game**:
   - Choose number of rounds (1–20)
   - Add 2–10 players (no duplicate names)
   - **Randomize player order**: Enable the "Random Order" checkbox and click "Preview" to see a shuffled order. Confirm before starting to prevent accidental starts.
4. **Bets phase**:
   - Enter each player’s bid for the round
   - Total bids are checked against total tricks
5. **Results phase**:
   - Enter tricks won, Harry adjustment, bonus points, and special cards
   - **Special cards are tracked for reference only** — add their points manually to the Bonus field if desired
   - See **live projected score** before saving
6. **Summary**:
   - View rankings, per-round breakdown, and cumulative scores
   - Export to CSV or Excel

---

## 🃏 Game Flow

1. **New Game** (`NewGame.tsx`)  
   - Set rounds & players  
   - Prevents duplicate names  
   - Starts with standard scoring preset

2. **Bets** (`Bets.tsx`)  
   - Enter bids (0 to `roundNumber + 1`)  
   - Shows total tricks vs total bids  
   - Saves to IndexedDB

3. **Results** (`Results.tsx`)  
   - Tricks, Harry adjustment, bonus, special cards  
   - Collapsible special card section  
   - Live projected score  
   - Locks round after save

4. **Summary** (`Summary.tsx`)  
   - Ranking with icons (👑, 🏴‍☠️, 🧜‍♀️, 👶)  
   - Per-round table with cumulative scores  
   - Export CSV/Excel  
   - Unlock & edit past rounds

---

## 📏 Scoring Rules

**Standard preset** (`scoringConfig.ts`):
- **Successful bid**: `bid × 20` points
- **Failed bid**: `-10 × difference` points
- **Zero bid success**: `roundNumber × 10` points
- **Zero bid fail**: `-roundNumber × 10` points
- **Harry adjustment**: ±2 to bid (if enabled)
- **Special cards**:  
  - All special cards are **tracked only** — they do not automatically affect the score.  
  - If you want them to count, add their points manually in the Bonus field.

---

## 📦 Export Formats

Exports include:
- Game ID, date, round number
- Player name & ID
- Bid, adjusted bid, tricks, bonus
- All special card counts
- Score

Formats:
- **CSV** (via PapaParse)
- **Excel (.xlsx)** (via SheetJS)

---

## 📡 Offline & PWA Support

- **IndexedDB** (via Dexie.js) for local storage
- **Installable** on mobile & desktop
- **Works offline** — no server required

---

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Dexie.js (IndexedDB)
- **Routing**: React Router DOM
- **PWA**: Vite PWA plugin + Workbox
- **Export**: PapaParse (CSV), SheetJS (Excel)

---

## 📂 Project Structure

```sh
src/
├── components/        # UI components
├── config/            # Scoring presets
├── hooks/             # Custom hooks
├── lib/               # DB, export, scoring utils
├── routes/            # Pages (NewGame, Bets, Results, Summary)
├── store/             # Zustand store
├── serviceWorker.ts   # PWA service worker
└── types.ts           # TypeScript types
```

---

## 🚀 Installation (Developers)

```bash
# Install dependencies
bun install

# Run dev server
bun run dev

# Build for production
bunx vite build
```

---

## 🗺 Roadmap

- [ ] Custom scoring rules in UI
- [ ] Automatic scoring for special cards
- [ ] Cross-game statistics & analytics
- [ ] Player performance tracking
- [ ] Data import (JSON, CSV, Excel)
- [ ] Cloud sync between devices

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/awesome-feature`
3. Commit changes: `git commit -m "Add awesome feature"`
4. Push & open a PR

Run `npm run lint` before submitting.

---

### 🔍 Notes
- **Special cards are tracked only** — they do not automatically affect the score.  
- Harry adjustment is **enabled in standard preset** and can be toggled in config.

