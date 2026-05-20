# NutriTrack — Codebase Context

## What This App Does

NutriTrack is a mobile-first food tracking web app. Users log daily consumption across four food categories (Carbs, Proteins, Fats, Vegetables) using unit increments. Each category has a maximum unit limit that varies by day type. Visual indicators (pill/circle shapes) fill up as the user logs food.

The app runs entirely in the browser — no backend, no build step. State persists in browser cookies.

---

## Tech Stack

- **React 18** via CDN (no npm, no bundler)
- **Tailwind CSS** via CDN
- **Babel Standalone** via CDN (compiles JSX in the browser at runtime)
- **Browser cookies** for all persistent storage
- Scripts are loaded as `type="text/babel"` in `index.html` and executed in order

**Important:** Because there is no bundler, all JS files share a single global scope. Variables defined in one file (e.g. `FOOD_CATEGORIES`, `UNIT_INCREMENT`) are available to all files loaded after it. Load order in `index.html` is critical.

---

## File Structure & Responsibilities

```
index.html                        Entry point; loads all scripts in order
css/styles.css                    Custom styles (slider, toggle switch, scrollbar hiding)
js/config.js                      Constants, food category definitions, URL param parsing
js/storage.js                     Cookie read/write, state migration, config URL generation
js/app.js                         Main component (NutriTrack), all core logic + rendering
js/components/FoodCategory.js     Standalone food category card (used in EditDayView)
js/components/HistoryView.js      14-day history list
js/components/EditDayView.js      Edit form for a historical day
js/components/DayTypeSelector.js  Segmented control (Normal / Sport / Free)
js/components/ResetSlider.js      Slide-to-reset control
js/components/DarkModeToggle.js   Light/dark toggle switch
js/weeklyBalance.js               DEAD CODE — functions are duplicated and inlined in app.js
```

> `weeklyBalance.js` and the original `WeeklyBalanceIndicator.js` are no longer loaded (commented out in `index.html`). All their logic lives in `app.js`.

---

## Data Model

State shape (stored in cookie `nutritrackState`):

```js
{
  currentDay: {
    date: "YYYY-MM-DD",
    dayType: "normal" | "sport" | "free",
    carbs: Number,
    proteins: Number,
    fats: Number,
    vegetables: Number,
    weight: Number | null,   // null = not entered today
    schemaVersion: 4,
    hasBeenEdited: Boolean
  },
  history: [ ...same shape as currentDay, no limit ]
}
```

- `history[0]` is always today; earlier dates follow in descending order.
- Display history is capped at **14 days** (`MAX_HISTORY_DAYS` in `config.js`).
- Future plan: store up to 52 weeks of weekly aggregates in a second cookie for historical weekly averages (not yet implemented). Daily data beyond 14 days cannot fit in a cookie.
- `hasBeenEdited` distinguishes user-entered days from auto-generated placeholder entries. Unedited days with all zeros show "No data for this day" in history view and are excluded from weekly balance calculations.
- On load, `ensureCompleteHistory()` fills the last 14 days with placeholder entries for any missing dates (`hasBeenEdited: false`).
- **Storage: browser cookies.** Main state in `nutritrackState` cookie (100-year expiry). Dark mode in `nutritrackDarkMode` cookie.

---

## Food Categories

Defined in `js/config.js` as `DEFAULT_FOOD_CATEGORIES`. Can be overridden via URL params.

| Category   | ID          | Color   | Normal Max | Sport Max | Free Max  |
|------------|-------------|---------|------------|-----------|-----------|
| Carbs      | `carbs`     | #E99D42 | 2.5        | 4.5       | ∞         |
| Proteins   | `proteins`  | #4C72B0 | 3.5        | 3.0       | ∞         |
| Fats       | `fats`      | #DD6E6E | 1.0        | 1.0       | ∞         |
| Vegetables | `vegetables`| #55AD7A | 2.5        | 2.5       | ∞         |

---

## Day Types

| Type    | ID       | Icon | Description                        |
|---------|----------|------|------------------------------------|
| Normal  | `normal` | 🍃   | Standard limits                    |
| Sport   | `sport`  | 🚴   | Higher carbs, slightly lower protein|
| Free    | `free`   | 🍰   | No limits; no red excess indicators|

---

## Unit Increment Modes

Controlled by `UNIT_INCREMENT` (either `0.5` or `0.25`):

- **0.5 mode (default):** Each unit = 2 half-circles side by side forming a full circle.
- **0.25 mode (`?i=25` URL param):** Each unit = 4 quarter segments forming a pill shape.

`renderUnitIndicators()` in `app.js` handles both modes. Excess units (over the max) render in red (`#FF3B30`) for non-free days.

Label color rules:
- Gray = normal
- Blue = exactly at max (`isMaxed`)
- Red = over max (`isExceeded`)

---

## Weekly Balance Logic

Calculated by `calculateWeeklyBalance(history)` in `app.js`:

1. Determines current week (Sunday–Saturday).
2. Filters history to days **in the current week but before today**. Skips unedited all-zero days.
3. For each category:
   - `actual` = sum of logged units across those days
   - `planned` = sum of `maxUnits[dayType]` for each day (free days use actual as planned, so they never show a deficit/surplus)
   - `difference` = actual − planned (positive = over, negative = under)
4. Only stores result if `Math.abs(difference) > 0.01` (avoids floating point noise).
5. Shown as `WeeklyBalanceIndicator` badges on each food category row. Red arrow = over, blue arrow = under.

---

## State Update Pattern

All state flows through `setAppState`. Every update:
1. Creates a new `currentDay` object (immutable update).
2. Finds today's index in `history` and updates that entry to match.
3. Calls `saveToCookie(newState)` before returning.

When editing a historical day, a local `editingDay` state is used as a staging area. On save, `saveEditedDay()` merges it back into `appState.history`. If the edited day is today, it also updates `currentDay`.

---

## URL Parameters

| Param | Example        | Effect                                                      |
|-------|----------------|-------------------------------------------------------------|
| `i`   | `?i=25`        | Sets increment to 0.25 (default 0.5)                        |
| `u`   | `?u=25-35-10-25` | Sets normal-day limits (values × 10, 4 numbers)           |
| `u`   | `?u=25-35-10-25-45-30-10-25` | First 4 = normal, next 4 = sport limits  |

URL params are parsed once at load time in `parseUrlParameters()` and never re-read. They do not persist between sessions.

---

## Views / Modes

The app has three mutually exclusive views controlled by `showHistory` and `editingDay` state:

1. **Today view** (default): `EnhancedFoodCategory` cards for each food category + weekly balance badges.
2. **History view** (`showHistory === true`): `HistoryView` lists the 14-day history. Each row has an edit button.
3. **Edit view** (`editingDay !== null`): `EditDayView` wraps `FoodCategory` + `DayTypeSelector` for a specific past day.

---

## Touch vs Click Handling

The app detects touch devices by listening for the first `touchstart` event and setting `isTouchActive = true`. After that, `onClick` handlers become no-ops to prevent double-firing on mobile. Touch events (`onTouchStart`/`onTouchEnd`) handle the actual interaction on mobile.

---

## Collaboration Rules

- **Always ask clarifying questions before implementing** when a request needs refinement — never assume.
- **Ask one question at a time** and wait for the answer before asking the next.
- **Never make architectural changes** (storage mechanism, dependencies, data format) without explicitly flagging the change and getting approval first.

---

## Versioning Convention

Version format is `major.minor.patch` (e.g. `1.10.0`), defined as `APP_VERSION` in `js/app.js`.

| Segment | When to increment |
|---------|-------------------|
| **Major** (`X`.y.z) | Very large changes — significant rewrites, new core concepts |
| **Minor** (x.`Y`.z) | Standard enhancements and new features |
| **Patch** (x.y.`Z`) | Bug fixes |

Always update `APP_VERSION` in `js/app.js` when making changes.

---

## Known Quirks / Notes

- `weeklyBalance.js` is loaded but **not included in `index.html`** — it's dead code. The functions there are duplicated in `app.js`. Do not edit `weeklyBalance.js` expecting it to affect the app.
- `FoodCategory.js` exists as a component but the main today-view uses `EnhancedFoodCategory` (defined inline in `app.js`) which adds weekly balance badge support. `FoodCategory.js` is only used in `EditDayView`.
- `formatUnitNumber` is defined in both `app.js` and `HistoryView.js` — the global scope means one overwrites the other depending on load order. They are functionally identical.
- Schema version is `3`. Cookie migration logic in `loadFromCookie()` handles upgrading older saved states.
- App version is `1.10.0` (defined as `APP_VERSION` in `app.js`).
