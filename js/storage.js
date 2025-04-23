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
              
              return savedState;
            }
            
            // If we have an old format (pre-history), migrate to new format
            const today = new Date().toISOString().split('T')[0];
            const validState = {
              currentDay: {
                date: today,
                dayType: 'normal',
                schemaVersion: DATA_SCHEMA_VERSION
              },
              history: [
                {
                  date: today,
                  dayType: 'normal',
                  schemaVersion: DATA_SCHEMA_VERSION
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
  return {
    currentDay: defaultDay,
    history: [{ ...defaultDay }]
  };
};
