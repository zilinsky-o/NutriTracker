// Storage functions for handling application state

// Save current state to a cookie
const saveToCookie = (state) => {
  try {
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 100);
    document.cookie = `nutritrackState=${JSON.stringify(state)};expires=${farFuture.toUTCString()};path=/;SameSite=Strict`;
  } catch (error) {
    console.error('Error saving to cookies:', error);
  }
};

// Save dark mode preference to a cookie
const saveDarkModeToCookie = (isDarkMode) => {
  try {
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 100);
    document.cookie = `nutritrackDarkMode=${isDarkMode ? '1' : '0'};expires=${farFuture.toUTCString()};path=/;SameSite=Strict`;
  } catch (error) {
    console.error('Error saving dark mode preference:', error);
  }
};

// Load dark mode preference from cookie or system preference
const loadDarkModeFromCookie = () => {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'nutritrackDarkMode') {
        return value === '1';
      }
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error loading dark mode preference:', error);
    return false;
  }
};

// Migrate a single day entry to the current schema version
const migrateDay = (day) => {
  const m = { ...day };
  if (!m.hasOwnProperty('schemaVersion')) m.schemaVersion = DATA_SCHEMA_VERSION;
  if (!m.hasOwnProperty('hasBeenEdited')) m.hasBeenEdited = true;
  if (!m.hasOwnProperty('weight')) m.weight = null;
  m.schemaVersion = DATA_SCHEMA_VERSION;
  return m;
};

// Load state from cookie
const loadFromCookie = () => {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'nutritrackState') {
        try {
          const savedState = JSON.parse(value);
          if (savedState && typeof savedState === 'object') {
            if (Array.isArray(savedState.history)) {
              const needsMigration = !savedState.currentDay.hasOwnProperty('weight') ||
                savedState.currentDay.schemaVersion !== DATA_SCHEMA_VERSION;
              const migrated = {
                currentDay: migrateDay(savedState.currentDay),
                history: savedState.history.map(migrateDay)
              };
              if (needsMigration) saveToCookie(migrated);
              return migrated;
            }

            // Old format (pre-history) migration
            const today = new Date().toISOString().split('T')[0];
            const validState = {
              currentDay: { ...getDefaultDayState(), date: today, hasBeenEdited: true },
              history: [{ ...getDefaultDayState(), date: today, hasBeenEdited: true }]
            };
            for (const category of FOOD_CATEGORIES) {
              const val = (savedState.hasOwnProperty(category.id) &&
                typeof savedState[category.id] === 'number' &&
                savedState[category.id] >= 0) ? savedState[category.id] : 0;
              validState.currentDay[category.id] = val;
              validState.history[0][category.id] = val;
            }
            return validState;
          }
        } catch (error) {
          console.error('Failed to parse saved state:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error loading from cookies:', error);
  }

  const defaultDay = { ...getDefaultDayState(), hasBeenEdited: true };
  return { currentDay: defaultDay, history: [{ ...defaultDay }] };
};

// Save weekly weight averages to a separate cookie
// Format: array of { d: "YYYY-MM-DD" (week start Sunday), avg: number, n: number (days with data) }
const saveWeeklyAverages = (weeklyAvgs) => {
  try {
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 100);
    const trimmed = weeklyAvgs.slice(0, MAX_WEEKLY_HISTORY);
    document.cookie = `${WEEKLY_WEIGHT_COOKIE}=${JSON.stringify(trimmed)};expires=${farFuture.toUTCString()};path=/;SameSite=Strict`;
  } catch (error) {
    console.error('Error saving weekly averages:', error);
  }
};

// Load weekly weight averages from cookie
const loadWeeklyAverages = () => {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === WEEKLY_WEIGHT_COOKIE) {
        const data = JSON.parse(value);
        if (Array.isArray(data)) return data;
      }
    }
  } catch (error) {
    console.error('Error loading weekly averages:', error);
  }
  return [];
};

// Generate URL with current unit configuration
const generateConfigUrl = () => {
  const normalUnits = FOOD_CATEGORIES.map(cat => Math.round(cat.maxUnits.normal * 10)).join('-');
  const sportUnits = FOOD_CATEGORIES.map(cat => Math.round(cat.maxUnits.sport * 10)).join('-');
  const isSame = normalUnits.split('-').every((v, i) => v === sportUnits.split('-')[i]);
  const paramValue = isSame ? normalUnits : `${normalUnits}-${sportUnits}`;
  const url = new URL(window.location.href);
  url.searchParams.set('u', paramValue);
  return url.toString();
};
