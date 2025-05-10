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
    
    // If no cookie found, check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error loading dark mode preference:', error);
    return false;
  }
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
            // Check if we have the expected data structure
            if (Array.isArray(savedState.history)) {
              // Add schema version if it doesn't exist (for future migrations)
              if (!savedState.currentDay.hasOwnProperty('schemaVersion')) {
                savedState.currentDay.schemaVersion = DATA_SCHEMA_VERSION;
                
                // Add schema version to each history item if missing
                savedState.history = savedState.history.map(day => ({ 
                  ...day, 
                  schemaVersion: day.schemaVersion || DATA_SCHEMA_VERSION
                }));
                
                // Save the updated data
                saveToCookie(savedState);
              }
              
              // Add hasBeenEdited flag to each history item if missing
              if (!savedState.currentDay.hasOwnProperty('hasBeenEdited')) {
                // For existing data, assume all entries have been edited
                savedState.currentDay.hasBeenEdited = true;
                
                savedState.history = savedState.history.map(day => ({ 
                  ...day, 
                  hasBeenEdited: true
                }));
                
                // Save the updated data
                saveToCookie(savedState);
              }
              
              return savedState;
            }
            
            // If we have an old format (pre-history), migrate to new format
            const today = new Date().toISOString().split('T')[0];
            const validState = {
              currentDay: {
                date: today,
                dayType: 'normal',
                schemaVersion: DATA_SCHEMA_VERSION,
                hasBeenEdited: true
              },
              history: [
                {
                  date: today,
                  dayType: 'normal',
                  schemaVersion: DATA_SCHEMA_VERSION,
                  hasBeenEdited: true
                }
              ]
            };
            
            // Migrate old values if they exist
            for (const category of FOOD_CATEGORIES) {
              const categoryId = category.id;
              const val = (savedState.hasOwnProperty(categoryId) && 
                typeof savedState[categoryId] === 'number' && 
                savedState[categoryId] >= 0) ? savedState[categoryId] : 0;
              
              validState.currentDay[categoryId] = val;
              validState.history[0][categoryId] = val;
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
  
  // Return default state if no valid saved state
  const defaultDay = getDefaultDayState();
  
  // Mark the current day as edited since it's being created explicitly
  defaultDay.hasBeenEdited = true;
  
  return {
    currentDay: defaultDay,
    history: [{ ...defaultDay }]
  };
};

// Generate URL with current unit configuration
const generateConfigUrl = () => {
  // Extract the units from the current configuration
  const normalUnits = FOOD_CATEGORIES.map(cat => Math.round(cat.maxUnits.normal * 10)).join('-');
  const sportUnits = FOOD_CATEGORIES.map(cat => Math.round(cat.maxUnits.sport * 10)).join('-');
  
  // Check if normal and sport are the same
  const normalValues = normalUnits.split('-');
  const sportValues = sportUnits.split('-');
  
  let isSame = true;
  for (let i = 0; i < normalValues.length; i++) {
    if (normalValues[i] !== sportValues[i]) {
      isSame = false;
      break;
    }
  }
  
  // If normal and sport are the same, only include normal units
  const paramValue = isSame ? normalUnits : `${normalUnits}-${sportUnits}`;
  
  // Get the current URL and update the u parameter
  const url = new URL(window.location.href);
  url.searchParams.set('u', paramValue);
  
  return url.toString();
};
