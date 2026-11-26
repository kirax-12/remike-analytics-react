# Remike Analytics

A small analytics dashboard for my Roblox games, built with **React + TypeScript** — stat cards, a hand-rolled SVG visits chart, a game switcher, and a 7-day / 30-day range toggle, all driven by React state.

The headline numbers are real: my **Fishing Game** has **155,000+ visits** with **88% positive likes**, and **Mount Nyong** has **156,000+ visits** with an **87% rating**.

## About the data — please read

- **Real:** the headline stats (total visits and like % per game) come from the games' Roblox pages.
- **Simulated:** the daily time series (last 30 days of visits/likes per game) is **sample data generated in code** — a seeded generator, so it is stable across reloads — shaped around the real headline totals. It is labelled "sample data" everywhere it appears in the UI.
- This demo does **not** call the Roblox API. The point of the project is the React/TypeScript front end, not a live data pipeline.

## Features

- **Stat cards** — total visits, average like %, games tracked, and visits inside the selected range (with a second-half vs first-half trend chip)
- **Visits chart** — hand-rolled SVG area/line chart (no chart library): computed scales, gridlines, axis labels, and a hover tooltip with per-day visits and like %
- **Game switcher** — view all games combined or filter to one game; the games table rows are clickable too and stay in sync
- **Range toggle** — 7-day / 30-day switch using React state; every stat, the chart, and the table recompute
- **Responsive layout** — stat grid and cards reflow from desktop to phone widths

## Tech used

- **React 19** — function components, `useState` / `useMemo`, props-driven child components
- **TypeScript** (strict mode) — typed game/series models in `src/data/games.ts`
- **Vite** — dev server and production build
- **Vanilla CSS** — neo-brutalist house style (cream paper, ink borders, hard offset shadows), no CSS framework
- **Hand-rolled SVG chart** — zero chart dependencies

## Project layout

```
src/
  data/games.ts          game catalogue (real headline stats) + seeded sample-series generator
  components/
    Header.tsx           title card + data-honesty badge
    StatCard.tsx         one headline stat card
    RangeToggle.tsx      7 / 30 day toggle
    GameSwitcher.tsx     all-games / per-game filter
    VisitsChart.tsx      hand-rolled SVG area chart with hover tooltip
    GameTable.tsx        per-game table (real totals, sample range columns)
  App.tsx                state (range + selected game) and dashboard layout
site/                    production build output — this is what gets deployed to GitHub Pages
```

## Run it locally

```bash
npm install
npm run dev
```

### Build for deployment

```bash
npm run build
```

The production payload lands in `site/` (configured in `vite.config.ts`, with a relative base path so it works from any GitHub Pages subpath). Serve that folder with any static host.

## Credits

Built by **Remike Dev** (GitHub: [@kirax-12](https://github.com/kirax-12)) — UI/UX designer & game developer.
