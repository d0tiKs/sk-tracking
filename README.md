# 📓💀👑 Skull King Tracker Progressive Web App
A lightweight, client-side tracking app for the Skull King card game built with React, TypeScript, Vite, and Tailwind CSS. It records bets, calculates scores, and helps you keep track of outcomes with a clean, responsive UI that works as a Progressive Web App.

## Key Features

- Complete game flow: New Game → Bets → Results → Summary
- Automatic score calculation based on configurable rules
- Client-side data storage using IndexedDB (via Dexie.js)
- Export data to CSV for external analysis
- Responsive design via Tailwind CSS
- Progressive Web App capabilities (installable, offline support)
- Built with a modern React Hook-first architecture and Zustand state management

## Project Structure

```sh
src/
├── components/
│ ├── CardCounter.tsx # component for tracking special cards
│ ├── Layout.tsx # page layout
│ ├── NumberStepper.tsx # number selector
│ └── ScoreChip.tsx # score display
├── config/
│ └── scoringConfig.ts # scoring logic
├── hooks/
│ └── useGame.ts # game state hook
├── lib/
│ ├── db.ts # IndexedDB wrapper with Dexie.js
│ ├── export.ts # CSV export functionality
│ ├── score.ts # scoring calculation utils
│ └── utils.ts # helper functions
├── routes/
│ ├── Bets.tsx # bid entry and management
│ ├── Home.tsx # main dashboard and game list
│ ├── NewGame.tsx # new game creation
│ ├── Results.tsx # round results entry 
│ └── Summary.tsx # final score summary
├── store/
│ └── useStore.ts # Zustand store for global state management
└── types.ts # TypeScript type definitions
```

## Game Flow Implementation

The app implements the complete Skull King game flow:

1. **New Game** - Create a new game with players and number of rounds
2. **Bets** - Enter bids for each player in the current round
3. **Results** - Record tricks won, bonuses and special cards collected.
4. **Summary** - View final scores and game statistics with round-by-round accumulated score

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (lightweight alternative to Redux)
- **Database**: Dexie.js (wrapper around IndexedDB for client-side storage)
- **Routing**: React Router DOM
- **PWA Support**: Vite PWA plugin with Workbox

## Data Flow and Storage

- Game data is stored locally in the browser using IndexedDB via Dexie.js
- All game state is managed through Zustand store
- Round data includes bids, results per player, and calculated scores
- Special card tracking for Skull King, Pirates, Mermaids, etc.
- Automatic calculation of round scores based on configurable scoring rules

## Current Features Implemented

    ✓ New Game creation with player management
    ✓ Bid entry for each player in a round
    ✓ Results entry including tricks won and special cards (with collapsible section)
    ✓ Automatic score calculation based on game rules
    ✓ Round progression tracking
    ✓ Game status management (in-progress, completed)
    ✓ Final score summary page with round-by-round score detail
    ✓ Local data persistence using IndexedDB
    ✓ Responsive UI that works as a PWA

## Missing Functionality (According to Game Flow Requirements)

The following features are missing from the current implementation:

- Custom scoring rule configuration
- Advanced special card handling (more complex bonus calculations)
- Multi-round game statistics and analytics
- Player performance tracking across multiple games
- Data import functionality
- Cloud synchronization between devices

## Installation

```bash
# install deps
npm install
# run the dev server
npm run dev
# build for production
npm run build
```
## Contributing

1. Fork the repository.
2. Create a new branch: git checkout -b feature/awesome-feature.
3. Commit your changes with a concise message.
4. Push and open a pull request.

Please follow the existing commit message guidelines and run npm run lint before submitting.

## Future Development Roadmap

- Add support for custom scoring rules
- Implement multiplayer synchronization
- Add game statistics and analytics dashboard
- Enhance special card handling with more complex bonus calculations
- Add data import/export in multiple formats (JSON, CSV)
- Improve PWA capabilities with better offline functionality
- Add player performance tracking across games
- Implement game history and replay features