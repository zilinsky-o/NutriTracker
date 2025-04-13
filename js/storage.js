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
                
                // Save the migrated data
                saveToCookie(savedState);
              }
              
              return savedState;
            }
            
            // If we have the old format (just tracking values), migrate to new format
            const today = new Date().toISOString().split('T')[0];
            const validState = {
              currentDay: {
                date: today,
                dayType: 'normal' // Add default day type
              },
              history: [
                {
                  date: today,
                  dayType: 'normal' // Add default day type
                }
              ]
            };
            
            // Migrate old values
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
