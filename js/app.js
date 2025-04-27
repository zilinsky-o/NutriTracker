// Main application component
console.log('NutriTrack script starting...');

// Define constants for weekly balance status
const WEEKLY_BALANCE_STATUS = {
  EXCESS: 'excess',
  UNDER: 'under',
  ON_TRACK: 'on-track'
};

// Threshold for determining if consumption is "on track" (±0.5 units)
const BALANCE_THRESHOLD = 0.5;

// Constants for long press feature
const UNIT_FINE_INCREMENT = 0.25; // Smaller increment for long press
const LONG_PRESS_DURATION = 500; // Duration in ms to detect a long press

// Update version number for new features and bug fixes
const APP_VERSION = '1.9.1';

// Weekly Balance utility functions
// Helper function to get the start date (Sunday) of the week containing the given date
const getWeekStartDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate how many days to go back to reach Sunday
  const daysToSubtract = day;
  
  // Create new date for Sunday
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - daysToSubtract);
  
  // Return in YYYY-MM-DD format
  return sunday.toISOString().split('T')[0];
};

// Helper function to get the end date (Saturday) of the week containing the given date
const getWeekEndDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate how many days to add to reach Saturday
  const daysToAdd = 6 - day;
  
  // Create new date for Saturday
  const saturday = new Date(date);
  saturday.setDate(date.getDate() + daysToAdd);
  
  // Return in YYYY-MM-DD format
  return saturday.toISOString().split('T')[0];
};

// Format date range for display
const formatWeekDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startMonth = start.toLocaleString('default', { month: 'short' });
  const endMonth = end.toLocaleString('default', { month: 'short' });
  
  const startDay = start.getDate();
  const endDay = end.getDate();
  
  // If same month, don't repeat month
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
};

// Calculate the weekly balance for all categories
const calculateWeeklyBalance = (history, today = new Date().toISOString().split('T')[0]) => {
  // Get current week's start and end dates
  const weekStart = getWeekStartDate(today);
  const weekEnd = getWeekEndDate(today);
  
  console.log(`Calculating weekly balance: ${weekStart} to ${weekEnd}`);
  
  // Filter history to only include days in current week that are not in the future
  const weekHistory = history.filter(day => {
    return day.date >= weekStart && day.date <= weekEnd && day.date <= today;
  });
  
  // Initialize results
  const results = {
    weekDateRange: formatWeekDateRange(weekStart, weekEnd),
    categories: {}
  };
  
  // If no history for this week, return empty results
  if (weekHistory.length === 0) {
    return results;
  }
  
  // For each category, calculate the balance
  FOOD_CATEGORIES.forEach(category => {
    const categoryId = category.id;
    
    // Calculate actual consumption for the week so far
    const actualConsumption = weekHistory.reduce((sum, day) => {
      return sum + (day[categoryId] || 0);
    }, 0);
    
    // Calculate planned consumption based on day types
    const plannedConsumption = weekHistory.reduce((sum, day) => {
      const dayType = day.dayType || 'normal';
      
      // For free meal days, count the consumption as planned
      // For other day types, use the maxUnits value
      if (dayType === 'free') {
        return sum + (day[categoryId] || 0);
      } else {
        return sum + category.maxUnits[dayType];
      }
    }, 0);
    
    // Calculate the difference (negative means under, positive means over)
    const difference = actualConsumption - plannedConsumption;
    
    // Store results
    results.categories[categoryId] = {
      actual: actualConsumption,
      planned: plannedConsumption,
      difference: difference
    };
  });
  
  return results;
};

// Improved format unit number for display to correctly show quarter units
const formatUnitNumber = (value) => {
  // If it's a whole number, don't show the decimal
  if (value === Math.floor(value)) {
    return value.toString();
  }
  
  // Format quarter units correctly
  const fractionalPart = value % 1;
  if (Math.abs(fractionalPart - 0.25) < 0.01) {
    return Math.floor(value) + ".25";
  } else if (Math.abs(fractionalPart - 0.5) < 0.01) {
    return Math.floor(value) + ".5";
  } else if (Math.abs(fractionalPart - 0.75) < 0.01) {
    return Math.floor(value) + ".75";
  }
  
  // Fallback to one decimal place
  return value.toFixed(1);
};

// Render half circles for a food category (improved to show quarter units)
const renderHalfCircles = (categoryId, category, dayData) => {
  const currentUnits = dayData[categoryId] || 0;
  const dayType = dayData.dayType || 'normal';
  const maxUnits = category.maxUnits[dayType];
  
  // For free meal days, we don't show excess units in red
  const isFreeMealDay = dayType === 'free';
  
  // Only check for exceeded if it's not a free meal day and maxUnits is finite
  const isExceeded = !isFreeMealDay && isFinite(maxUnits) && currentUnits > maxUnits;
  
  // For regular days, cap the visual display at maxUnits
  // For free days, show all units in the regular color
  const fullUnits = isFreeMealDay ? currentUnits : (isExceeded ? maxUnits : currentUnits);
  const excessUnits = isFreeMealDay ? 0 : (isExceeded ? currentUnits - maxUnits : 0);
  
  // For free days, adapt the number of circles shown
  // We want to show at least the normal day max (for reference) plus any excess
  const displayMax = isFreeMealDay 
    ? Math.max(category.maxUnits.normal, Math.ceil(currentUnits))
    : maxUnits;
  
  // Each full unit is represented by 4 quarter-circles (instead of 2 half-circles)
  const totalQuarterCircles = displayMax * 4;
  const fullQuarterCircles = Math.round(fullUnits * 4);  // Round to handle potential floating point issues
  
  // Create an array to hold all quarter circles
  const units = [];
  
  // Generate the circles
  for (let i = 0; i < totalQuarterCircles; i += 4) {
    // Each set of 4 quarters represents one full unit
    const unitIndex = i / 4;
    const remainingQuarters = Math.max(0, Math.min(4, fullQuarterCircles - i));
    
    // Container for this unit
    const unitContainer = (
      <div key={`unit-${unitIndex}`} className="flex items-center mx-1 my-1">
        <div className="relative w-10 h-10 rounded-full">
          {/* Base circle (outline) */}
          <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
          
          {/* First quarter (0-25%) */}
          {remainingQuarters >= 1 && (
            <div className="absolute top-0 left-0 w-1/2 h-1/2 overflow-hidden">
              <div className="absolute top-0 left-0 w-10 h-10 rounded-full" style={{ backgroundColor: category.color }}></div>
            </div>
          )}
          
          {/* Second quarter (25-50%) */}
          {remainingQuarters >= 2 && (
            <div className="absolute top-0 right-0 w-1/2 h-1/2 overflow-hidden">
              <div className="absolute top-0 right-0 w-10 h-10 rounded-full" style={{ backgroundColor: category.color }}></div>
            </div>
          )}
          
          {/* Third quarter (50-75%) */}
          {remainingQuarters >= 3 && (
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 overflow-hidden">
              <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full" style={{ backgroundColor: category.color }}></div>
            </div>
          )}
          
          {/* Fourth quarter (75-100%) */}
          {remainingQuarters >= 4 && (
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 overflow-hidden">
              <div className="absolute bottom-0 left-0 w-10 h-10 rounded-full" style={{ backgroundColor: category.color }}></div>
            </div>
          )}
        </div>
      </div>
    );
    
    units.push(unitContainer);
    
    // Break if we've reached the display max
    if (unitIndex >= displayMax - 1) break;
  }
  
  // Handle excess units similarly
  const excessQuarterCircles = Math.round(excessUnits * 4);
  const excess = [];
  
  if (!isFreeMealDay && excessQuarterCircles > 0) {
    for (let i = 0; i < excessQuarterCircles; i += 4) {
      // Each set of 4 quarters represents one full unit
      const unitIndex = i / 4;
      const remainingQuarters = Math.max(0, Math.min(4, excessQuarterCircles - i));
      
      // Container for this excess unit
      const excessContainer = (
        <div key={`excess-${unitIndex}`} className="flex items-center mx-1 my-1">
          <div className="relative w-10 h-10 rounded-full">
            {/* Base circle (outline) */}
            <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
            
            {/* First quarter (0-25%) */}
            {remainingQuarters >= 1 && (
              <div className="absolute top-0 left-0 w-1/2 h-1/2 overflow-hidden">
                <div className="absolute top-0 left-0 w-10 h-10 rounded-full" style={{ backgroundColor: '#FF3B30' }}></div>
              </div>
            )}
            
            {/* Second quarter (25-50%) */}
            {remainingQuarters >= 2 && (
              <div className="absolute top-0 right-0 w-1/2 h-1/2 overflow-hidden">
                <div className="absolute top-0 right-0 w-10 h-10 rounded-full" style={{ backgroundColor: '#FF3B30' }}></div>
              </div>
            )}
            
            {/* Third quarter (50-75%) */}
            {remainingQuarters >= 3 && (
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 overflow-hidden">
                <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full" style={{ backgroundColor: '#FF3B30' }}></div>
              </div>
            )}
            
            {/* Fourth quarter (75-100%) */}
            {remainingQuarters >= 4 && (
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 overflow-hidden">
                <div className="absolute bottom-0 left-0 w-10 h-10 rounded-full" style={{ backgroundColor: '#FF3B30' }}></div>
              </div>
            )}
          </div>
        </div>
      );
      
      excess.push(excessContainer);
    }
  }
  
  return [...units, ...excess];
};

// The Weekly Balance Indicator component
const WeeklyBalanceIndicator = ({ category, balance }) => {
  // Skip rendering if balance is null/undefined (not enough data)
  if (balance === null || balance === undefined) {
    return null;
  }
  
  // Determine status based on balance
  const getStatus = (diff) => {
    if (Math.abs(diff) < 0.01) { // Only consider exact 0 as on-track
      return WEEKLY_BALANCE_STATUS.ON_TRACK;
    }
    return diff > 0 ? WEEKLY_BALANCE_STATUS.EXCESS : WEEKLY_BALANCE_STATUS.UNDER;
  };
  
  const status = getStatus(balance);
  
  // Get appropriate icon for status
  const getStatusIcon = (statusType) => {
    switch(statusType) {
      case WEEKLY_BALANCE_STATUS.EXCESS: 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline -mt-0.5 mr-0.5 fill-red-500 dark:fill-red-400" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case WEEKLY_BALANCE_STATUS.UNDER:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline -mt-0.5 mr-0.5 fill-blue-500 dark:fill-blue-400" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case WEEKLY_BALANCE_STATUS.ON_TRACK:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline -mt-0.5 mr-0.5 fill-green-500 dark:fill-green-400" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default: 
        return null;
    }
  };
  
  // Get text color based on status
  const getStatusColor = (statusType) => {
    switch(statusType) {
      case WEEKLY_BALANCE_STATUS.EXCESS: 
        return 'text-red-500 dark:text-red-400';
      case WEEKLY_BALANCE_STATUS.UNDER: 
        return 'text-blue-500 dark:text-blue-400';
      case WEEKLY_BALANCE_STATUS.ON_TRACK: 
        return 'text-green-500 dark:text-green-400';
      default: 
        return 'text-gray-500 dark:text-gray-400';
    }
  };
  
  // Format the difference value for display with proper quarter unit formatting
  const formatDifference = (diff) => {
    // Round to nearest quarter unit
    const rounded = Math.round(diff * 4) / 4;
    
    // Format with proper decimal display
    if (rounded === Math.floor(rounded)) {
      // Whole number
      return rounded > 0 ? `+${rounded}` : `${rounded}`;
    } else {
      // Quarter, half, or three-quarter units
      const fractionalPart = Math.abs(rounded) % 1;
      const integerPart = Math.floor(Math.abs(rounded));
      let formattedValue;
      
      if (Math.abs(fractionalPart - 0.25) < 0.01) {
        formattedValue = `${integerPart}.25`;
      } else if (Math.abs(fractionalPart - 0.5) < 0.01) {
        formattedValue = `${integerPart}.5`;
      } else if (Math.abs(fractionalPart - 0.75) < 0.01) {
        formattedValue = `${integerPart}.75`;
      } else {
        formattedValue = Math.abs(rounded).toFixed(2);
      }
      
      return rounded > 0 ? `+${formattedValue}` : `-${formattedValue}`;
    }
  };
  
  // Get tooltip text based on status
  const getTooltipText = (statusType, diff, categoryName) => {
    switch(statusType) {
      case WEEKLY_BALANCE_STATUS.EXCESS:
        return `You're ${Math.abs(diff).toFixed(2)} units over on ${categoryName.toLowerCase()} this week. Consider reducing intake.`;
      case WEEKLY_BALANCE_STATUS.UNDER:
        return `You're ${Math.abs(diff).toFixed(2)} units under on ${categoryName.toLowerCase()} this week. Try to increase intake.`;
      case WEEKLY_BALANCE_STATUS.ON_TRACK:
        return `You're on track with ${categoryName.toLowerCase()} this week. Keep it up!`;
      default:
        return '';
    }
  };
  
  // Background color based on status
  const getBgColor = (statusType) => {
    switch(statusType) {
      case WEEKLY_BALANCE_STATUS.EXCESS:
        return 'bg-red-100 dark:bg-red-900/30';
      case WEEKLY_BALANCE_STATUS.UNDER:
        return 'bg-blue-100 dark:bg-blue-900/30';
      case WEEKLY_BALANCE_STATUS.ON_TRACK:
        return 'bg-green-100 dark:bg-green-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };
  
  return (
    <div className={`flex items-center ml-auto px-2 py-1 rounded-md ${getBgColor(status)}`}>
      <span className={`text-xs font-medium ${getStatusColor(status)}`}>
        {getStatusIcon(status)} {formatDifference(balance)}
      </span>
      
      {/* Info tooltip */}
      <div className="group relative cursor-help ml-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">ⓘ</span>
        <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-white dark:bg-gray-700 shadow-lg rounded-md text-xs text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
          {getTooltipText(status, balance, category.name)}
        </div>
      </div>
    </div>
  );
};

// The main NutriTrack component with its functionality
const NutriTrack = () => {
  console.log('Initializing NutriTrack component...');
  
  // Set up state with history
  const [appState, setAppState] = React.useState(loadFromCookie());
  const [sliderValue, setSliderValue] = React.useState(0);
  const [isTouchActive, setIsTouchActive] = React.useState(false);
  const [activeButton, setActiveButton] = React.useState(null);
  const [showHistory, setShowHistory] = React.useState(false);
  const [editingDay, setEditingDay] = React.useState(null);
  const [isDarkMode, setIsDarkMode] = React.useState(loadDarkModeFromCookie());
  const [weeklyBalance, setWeeklyBalance] = React.useState(null);
  
  // New state for long press functionality
  const [longPressTimer, setLongPressTimer] = React.useState(null);
  const [isLongPress, setIsLongPress] = React.useState(false);
  
  // Shorthand for current day's unit counts
  const unitCounts = appState.currentDay;
  
  // Apply dark mode class to document
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveDarkModeToCookie(isDarkMode);
  }, [isDarkMode]);
  
  // Calculate weekly balance when history changes
  React.useEffect(() => {
    console.log('Calculating weekly balance from history...');
    try {
      const balance = calculateWeeklyBalance(appState.history);
      console.log('Weekly balance calculated:', balance);
      setWeeklyBalance(balance);
    } catch (error) {
      console.error('Error calculating weekly balance:', error);
    }
  }, [appState.history]);
  
  // Check if current day needs to be reset
  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // If the current day is not today, create a new day
    if (unitCounts.date !== today) {
      const newDay = {
        ...getDefaultDayState(),
        dayType: unitCounts.dayType || 'normal' // Keep the last selected day type
      };
      
      setAppState(prevState => {
        const newState = {
          currentDay: newDay,
          history: [newDay, ...prevState.history.slice(0, MAX_HISTORY_DAYS - 1)] // Keep limited days
        };
        saveToCookie(newState);
        return newState;
      });
    }
  }, []);
  
  // Detect touch device
  React.useEffect(() => {
    const touchStartHandler = () => {
      setIsTouchActive(true);
      window.removeEventListener('touchstart', touchStartHandler);
    };
    
    window.addEventListener('touchstart', touchStartHandler);
    return () => {
      window.removeEventListener('touchstart', touchStartHandler);
    };
  }, []);
  
  // Event handlers
  const updateUnitCount = (categoryId, newValue, day = null) => {
    if (newValue < 0) return;
    
    // For fine increments (0.25), we round to nearest quarter unit
    // For regular increments (0.5), we round to nearest half unit
    const roundingFactor = isLongPress ? 4 : 2; // 4 for quarter units, 2 for half units
    newValue = Math.round(newValue * roundingFactor) / roundingFactor;
    
    if (day) {
      // We're editing a specific history day
      setEditingDay(prevDay => ({
        ...prevDay,
        [categoryId]: newValue
      }));
    } else {
      // We're updating the current day
      setAppState(prevState => {
        // Find the history index for today (should be index 0, but let's be safe)
        const today = new Date().toISOString().split('T')[0];
        const historyIndex = prevState.history.findIndex(day => day.date === today);
        
        // Deep clone the history array
        const newHistory = [...prevState.history];
        
        // Create new current day object
        const newCurrentDay = { ...prevState.currentDay, [categoryId]: newValue };
        
        // Update today's history entry if it exists
        if (historyIndex >= 0) {
          newHistory[historyIndex] = { ...newHistory[historyIndex], [categoryId]: newValue };
        } else {
          // Add today to history if not found (shouldn't happen, but just in case)
          newHistory.unshift({ ...newCurrentDay });
        }
        
        const newState = {
          currentDay: newCurrentDay,
          history: newHistory
        };
        
        saveToCookie(newState);
        return newState;
      });
    }
  };
  
  const incrementUnit = (categoryId, day = null) => {
    const increment = isLongPress ? UNIT_FINE_INCREMENT : UNIT_INCREMENT;
    
    if (day) {
      // We're editing a historical day
      updateUnitCount(categoryId, (day[categoryId] || 0) + increment, day);
    } else {
      // We're updating the current day
      updateUnitCount(categoryId, unitCounts[categoryId] + increment);
    }
  };

  const decrementUnit = (categoryId, day = null) => {
    const increment = isLongPress ? UNIT_FINE_INCREMENT : UNIT_INCREMENT;
    
    if (day) {
      // We're editing a historical day
      if ((day[categoryId] || 0) >= increment) {
        updateUnitCount(categoryId, day[categoryId] - increment, day);
      }
    } else {
      // We're updating the current day
      if (unitCounts[categoryId] >= increment) {
        updateUnitCount(categoryId, unitCounts[categoryId] - increment);
      }
    }
  };
  
  const handleDayTypeChange = (newDayType, day = null) => {
    if (day) {
      // We're editing a historical day
      setEditingDay(prevDay => ({
        ...prevDay,
        dayType: newDayType
      }));
    } else {
      // We're updating the current day
      setAppState(prevState => {
        // Update current day type
        const newCurrentDay = { ...prevState.currentDay, dayType: newDayType };
        
        // Update history for today
        const today = newCurrentDay.date;
        const historyIndex = prevState.history.findIndex(day => day.date === today);
        const newHistory = [...prevState.history];
        
        if (historyIndex >= 0) {
          newHistory[historyIndex] = { ...newHistory[historyIndex], dayType: newDayType };
        }
        
        const newState = {
          currentDay: newCurrentDay,
          history: newHistory
        };
        
        saveToCookie(newState);
        return newState;
      });
    }
  };
  
  const handleSliderChange = (e) => {
    setSliderValue(parseInt(e.target.value, 10));
    
    if (parseInt(e.target.value, 10) === 100) {
      // Reset current day but keep history and day type
      setAppState(prevState => {
        const newCurrentDay = {
          ...getDefaultDayState(),
          dayType: prevState.currentDay.dayType // Preserve day type
        };
        
        // Update history for current day
        const today = newCurrentDay.date;
        const historyIndex = prevState.history.findIndex(day => day.date === today);
        const newHistory = [...prevState.history];
        
        if (historyIndex >= 0) {
          newHistory[historyIndex] = { ...newCurrentDay };
        } else {
          newHistory.unshift({ ...newCurrentDay });
        }
        
        const newState = {
          currentDay: newCurrentDay,
          history: newHistory
        };
        
        saveToCookie(newState);
        return newState;
      });
      
      setTimeout(() => {
        setSliderValue(0);
      }, 300);
    }
  };
  
  // Touch handlers for mobile devices
  const handleTouchStart = (id, action, day = null) => {
    setActiveButton(`${id}-${action}`);
    
    // Clear any existing timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
    
    // Set a timer to detect long press
    const timer = setTimeout(() => {
      console.log('Long press detected');
      setIsLongPress(true);
      
      // Perform action with fine increment
      if (action === 'inc') {
        incrementUnit(id, day);
      } else if (action === 'dec') {
        decrementUnit(id, day);
      }
    }, LONG_PRESS_DURATION);
    
    setLongPressTimer(timer);
    
    // Perform initial action with regular increment
    if (action === 'inc') {
      incrementUnit(id, day);
    } else if (action === 'dec') {
      decrementUnit(id, day);
    }
  };
  
  const handleTouchEnd = () => {
    // Only clear the button highlight after a short delay to avoid flickering
    setTimeout(() => {
      setActiveButton(null);
    }, 50);
    
    // Clear the long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Reset long press state
    setIsLongPress(false);
  };
  
  // Mouse event handlers for desktop
  const handleMouseDown = (id, action, day = null) => {
    if (isTouchActive) return; // Skip for touch devices
    
    setActiveButton(`${id}-${action}`);
    
    // Clear any existing timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
    
    // Set a timer to detect long press
    const timer = setTimeout(() => {
      console.log('Long mouse press detected');
      setIsLongPress(true);
      
      // Perform action with fine increment
      if (action === 'inc') {
        incrementUnit(id, day);
      } else if (action === 'dec') {
        decrementUnit(id, day);
      }
    }, LONG_PRESS_DURATION);
    
    setLongPressTimer(timer);
    
    // Perform initial action with regular increment
    if (action === 'inc') {
      incrementUnit(id, day);
    } else if (action === 'dec') {
      decrementUnit(id, day);
    }
  };
  
  const handleMouseUp = () => {
    if (isTouchActive) return; // Skip for touch devices
    
    // Only clear the button highlight after a short delay to avoid flickering
    setTimeout(() => {
      setActiveButton(null);
    }, 50);
    
    // Clear the long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Reset long press state
    setIsLongPress(false);
  };
  
  // Only for regular clicks (no long press support)
  const handleClick = (id, action, day = null) => {
    // This is now handled by mouseDown/mouseUp for both regular and long press
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    // Exit editing mode when toggling history
    setEditingDay(null);
  };
  
  const startEditingDay = (day) => {
    // Create a copy of the day to edit
    setEditingDay({...day});
    setShowHistory(false);
  };
  
  const saveEditedDay = () => {
    setAppState(prevState => {
      // Find the day in history by date
      const dayIndex = prevState.history.findIndex(day => day.date === editingDay.date);
      
      if (dayIndex >= 0) {
        // Create new history array with updated day
        const newHistory = [...prevState.history];
        newHistory[dayIndex] = {...editingDay};
        
        // If we're editing today, also update currentDay
        const today = new Date().toISOString().split('T')[0];
        let newCurrentDay = prevState.currentDay;
        
        if (editingDay.date === today) {
          newCurrentDay = {...editingDay};
        }
        
        const newState = {
          currentDay: newCurrentDay,
          history: newHistory
        };
        
        saveToCookie(newState);
        return newState;
      }
      
      return prevState;
    });
    
    // Exit editing mode and show history
    setEditingDay(null);
    setShowHistory(true);
  };
  
  const cancelEditing = () => {
    // Simply exit editing mode and return to history
    setEditingDay(null);
    setShowHistory(true);
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Enhanced FoodCategory with quarter unit support
  const EnhancedFoodCategory = ({ 
    category, 
    unitCount, 
    dayType,
    activeButton, 
    onTouchStart, 
    onTouchEnd,
    onMouseDown,
    onMouseUp,
    onClick,
    weeklyBalance = null
  }) => {
    const maxUnits = category.maxUnits[dayType];
    const isFreeMealDay = dayType === 'free';
    
    // Only apply exceeded and maxed styling for normal and sport days
    const isExceeded = !isFreeMealDay && isFinite(maxUnits) && unitCount > maxUnits;
    const isMaxed = !isFreeMealDay && Math.abs(unitCount - maxUnits) < 0.01; // Close enough to max
    
    let labelColor = 'text-gray-700 dark:text-gray-300';
    if (isExceeded) {
      labelColor = 'text-red-500';
    } else if (isMaxed) {
      labelColor = 'text-blue-500';
    }
    
    // Get weekly balance for this category
    const categoryBalance = weeklyBalance?.categories?.[category.id]?.difference || null;
    
    return (
      <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        {/* HEADER - category name and +/- buttons */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className={`text-lg font-semibold ${labelColor}`}>
              {category.name} ({formatUnitNumber(unitCount)}
              {isFreeMealDay ? '' : `/${formatUnitNumber(maxUnits)}`})
            </h2>
          </div>
          <div className="flex space-x-2">
            <button 
              onTouchStart={() => onTouchStart(category.id, 'dec')}
              onTouchEnd={onTouchEnd}
              onMouseDown={() => onMouseDown(category.id, 'dec')}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              disabled={unitCount <= 0}
              className={`w-12 h-12 flex items-center justify-center text-lg font-bold rounded-full focus:outline-none transition-colors duration-150 ${
                activeButton === `${category.id}-dec` 
                  ? (isLongPress 
                      ? 'bg-indigo-400 dark:bg-indigo-600 text-white' // Long press style
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200') // Regular press style
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              } disabled:opacity-40`}
              aria-label={`Decrease ${category.name}`}
            >
              -
            </button>
            <button 
              onTouchStart={() => onTouchStart(category.id, 'inc')}
              onTouchEnd={onTouchEnd}
              onMouseDown={() => onMouseDown(category.id, 'inc')}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              className={`w-12 h-12 flex items-center justify-center text-lg font-bold rounded-full focus:outline-none transition-colors duration-150 ${
                activeButton === `${category.id}-inc` 
                  ? (isLongPress 
                      ? 'bg-indigo-400 dark:bg-indigo-600 text-white' // Long press style
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200') // Regular press style 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              aria-label={`Increase ${category.name}`}
            >
              +
            </button>
          </div>
        </div>
        
        {/* BODY - quarter-circle units and weekly balance indicator */}
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap overflow-x-auto py-2 hide-scrollbar">
            {renderHalfCircles(category.id, category, { [category.id]: unitCount, dayType })}
          </div>
          
          {/* Show weekly balance indicator if data is available */}
          {weeklyBalance && categoryBalance !== null && (
            <WeeklyBalanceIndicator 
              category={category} 
              balance={categoryBalance} 
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto p-4 bg-white dark:bg-gray-900 shadow-lg sm:my-4 sm:rounded-xl no-select transition-colors">
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">NutriTrack</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Track your daily food intake</p>
        
        {/* Show different UI elements based on current mode */}
        {!editingDay && !showHistory && (
          <DayTypeSelector 
            currentDayType={unitCounts.dayType || 'normal'} 
            onChange={(newType) => handleDayTypeChange(newType)}
          />
        )}
        
        {/* Weekly date range display */}
        {!editingDay && !showHistory && weeklyBalance && (
          <div className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">
            Week: {weeklyBalance.weekDateRange}
          </div>
        )}
        
        {!editingDay && (
          <div className="flex justify-center mt-2">
            <button 
              onClick={toggleHistory}
              className="px-4 py-1 text-sm bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>
        )}
      </header>
      
      <main className="flex-grow">
        {editingDay ? (
          // Editing a historical day
          <EditDayView
            day={editingDay}
            onSave={saveEditedDay}
            onCancel={cancelEditing}
            activeButton={activeButton}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
            onDayTypeChange={(newType) => handleDayTypeChange(newType, editingDay)}
          />
        ) : showHistory ? (
          // History view
          <HistoryView 
            history={appState.history} 
            onEditDay={startEditingDay}
          />
        ) : (
          // Today's tracking with weekly balance indicators
          FOOD_CATEGORIES.map(category => (
            <EnhancedFoodCategory
              key={category.id}
              category={category}
              unitCount={unitCounts[category.id]}
              dayType={unitCounts.dayType || 'normal'}
              activeButton={activeButton}
              onTouchStart={(id, action) => handleTouchStart(id, action)}
              onTouchEnd={handleTouchEnd}
              onMouseDown={(id, action) => handleMouseDown(id, action)}
              onMouseUp={handleMouseUp}
              onClick={(id, action) => handleClick(id, action)}
              weeklyBalance={weeklyBalance} // Pass weekly balance data
            />
          ))
        )}
      </main>
      
      {!editingDay && !showHistory && (
        <footer className="mt-4 mb-4">
          <ResetSlider
            value={sliderValue}
            onChange={handleSliderChange}
          />
          
          {/* Dark Mode Toggle */}
          <DarkModeToggle 
            isDarkMode={isDarkMode}
            onChange={toggleDarkMode}
          />
        </footer>
      )}
      
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
        NutriTrack v{APP_VERSION}
      </div>
    </div>
  );
};

// Mount the app with explicit error handling
try {
  console.log('Attempting to render NutriTrack...');
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<NutriTrack />);
} catch (error) {
  console.error('Error rendering app:', error);
  document.getElementById('root').innerHTML = `
    <div style="text-align: center; margin-top: 40px; color: #666;">
      <h2>There was an error loading NutriTrack</h2>
      <p>${error.message}</p>
      <p>Please try refreshing the page.</p>
    </div>
  `;
}
