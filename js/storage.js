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

// Migrate data to half units
const migrateToHalfUnits = (data) => {
  // Get all category IDs
  const categoryIds = FOOD_CATEGORIES.map(cat => cat.id);
  
  // Update current day values
  categoryIds.forEach(catId => {
    if (typeof data.currentDay[catId] === 'number' && Number.isInteger(data.currentDay[catId])) {
      data.currentDay[catId] = data.currentDay[catId] / 2;
    }
  });
  
  // Update history values
  if (Array.isArray(data.history)) {
    data.history.forEach(day => {
      categoryIds.forEach(catId => {
        if (typeof day[catId] === 'number' && Number.isInteger(day[catId])) {
          day[catId] = day[catId] / 2;
        }
      });
    });
  }
  
  // Set schema version to current
  data.currentDay.schemaVersion = DATA_SCHEMA_VERSION;
  
  if (Array.isArray(data.history)) {
    data.history.forEach(day => {
      day.schemaVersion = DATA_SCHEMA_VERSION;
    });
  }
  
  return data;
};

// Load state from cookie, with data migration handling
const loadFromCookie = () => {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'nutritrackState') {
        try {
          const savedState = JSON.parse(value);
          if (savedState && typeof savedState === 'object') {
            let needsMigration = false;
            
            // Format has changed - if we have history array, great
            if (Array.isArray(savedState.history)) {
              // Check if we need to migrate dayType field
              const needsDayTypeMigration = !savedState.currentDay.hasOwnProperty('dayType');
              
              if (needsDayTypeMigration) {
                // Add dayType to currentDay
                savedState.currentDay.dayType = 'normal';
                
                // Add dayType to each history item
                savedState.history = savedState.history.map(day => ({ 
                  ...day, 
                  dayType: day.dayType || 'normal' 
                }));
                
                needsMigration = true;
              }
              
              // Check if we need to migrate to half units
              const needsHalfUnitMigration = 
                !savedState.currentDay.hasOwnProperty('schemaVersion') || 
                savedState.currentDay.schemaVersion < DATA_SCHEMA_VERSION;
              
              if (needsHalfUnitMigration) {
                savedState = migrateToHalfUnits(savedState);
                needsMigration = true;
              }
              
              // Save the migrated data if needed
              if (needsMigration) {
                saveToCookie(savedState);
              }
              
              return savedState;
            }
            
            // If we have the old format (just tracking values), migrate to new format
            const today = new Date().toISOString().split('T')[0];
            const validState = {
              currentDay: {
                date: today,
                dayType: 'normal', // Add default day type
                schemaVersion: DATA_SCHEMA_VERSION
              },
              history: [
                {
                  date: today,
                  dayType: 'normal', // Add default day type
                  schemaVersion: DATA_SCHEMA_VERSION
                }
              ]
            };
            
            // Migrate old values with half units
            for (const category of FOOD_CATEGORIES) {
              const categoryId = category.id;
              let val = (savedState.hasOwnProperty(categoryId) && 
                typeof savedState[categoryId] === 'number' && 
                savedState[categoryId] >= 0) ? savedState[categoryId] : 0;
              
              // Convert to half units if it's an integer
              if (Number.isInteger(val)) {
                val = val / 2;
              }
              
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
