// Main application component
console.log('NutriTrack script starting...');

// Constants for fine increment control
const UNIT_FINE_INCREMENT = 0.25; // Smaller increment for long press
const LONG_PRESS_DURATION = 500; // Duration in ms to detect a long press

// Update version number for new features and bug fixes
const APP_VERSION = '1.9.1';

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
  
  // State for long press functionality
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
  
  const incrementUnit = (categoryId, day = null, useFinePrecision = false) => {
    const increment = useFinePrecision ? UNIT_FINE_INCREMENT : UNIT_INCREMENT;
    
    if (day) {
      // We're editing a historical day
      updateUnitCount(categoryId, (day[categoryId] || 0) + increment, day);
    } else {
      // We're updating the current day
      updateUnitCount(categoryId, unitCounts[categoryId] + increment);
    }
  };

  const decrementUnit = (categoryId, day = null, useFinePrecision = false) => {
    const increment = useFinePrecision ? UNIT_FINE_INCREMENT : UNIT_INCREMENT;
    
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
  
  const handleTouchStart = (id, action, day = null) => {
    setActiveButton(`${id}-${action}`);
    setIsLongPress(false); // Start with regular mode
    
    // Clear any existing timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
    
    // Set a timer to detect long press
    const timer = setTimeout(() => {
      console.log('Long press detected');
      setIsLongPress(true); // Switch to long press mode
      
      // We don't do anything here - just mark as long press
      // The action will happen on touch end
    }, LONG_PRESS_DURATION);
    
    setLongPressTimer(timer);
    
    // Perform initial action with regular increment
    if (action === 'inc') {
      incrementUnit(id, day, false); // Use standard increment
    } else if (action === 'dec') {
      decrementUnit(id, day, false); // Use standard increment
    }
  };
  
  // For mouse events (desktop)
  const handleMouseDown = (id, action, day = null) => {
    if (isTouchActive) return; // Skip for touch devices
    
    setActiveButton(`${id}-${action}`);
    setIsLongPress(false); // Start with regular mode
    
    // Clear any existing timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
    
    // Set a timer to detect long press
    const timer = setTimeout(() => {
      console.log('Long mouse press detected');
      setIsLongPress(true); // Switch to long press mode
      
      // We don't do anything here - just mark as long press
      // The action will happen on mouse up
    }, LONG_PRESS_DURATION);
    
    setLongPressTimer(timer);
    
    // Perform initial action with regular increment
    if (action === 'inc') {
      incrementUnit(id, day, false); // Use standard increment
    } else if (action === 'dec') {
      decrementUnit(id, day, false); // Use standard increment
    }
  };
  
  // Common handler for button release (touch or mouse)
  const handleButtonRelease = (id, action, day = null) => {
    // If long press was active, perform the fine-grained adjustment
    if (isLongPress) {
      console.log('Applying fine adjustment on release');
      if (action === 'inc') {
        incrementUnit(id, day, true); // Use fine increment
      } else if (action === 'dec') {
        decrementUnit(id, day, true); // Use fine increment
      }
    }
    
    // Reset states (with a small delay to prevent flicker)
    setTimeout(() => {
      setActiveButton(null);
    }, 50);
    
    setIsLongPress(false);
    
    // Clear the long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };
  
  const handleTouchEnd = (id, action, day = null) => {
    handleButtonRelease(id, action, day);
  };
  
  const handleMouseUp = (id, action, day = null) => {
    if (isTouchActive) return; // Skip for touch devices
    handleButtonRelease(id, action, day);
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

  // Enhanced FoodCategory for current tracking screen
  const EnhancedFoodCategory = ({ 
    category, 
    unitCount, 
    dayType,
    activeButton, 
    onTouchStart, 
    onTouchEnd,
    onMouseDown,
    onMouseUp,
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
              onTouchEnd={() => onTouchEnd(category.id, 'dec')}
              onMouseDown={() => onMouseDown(category.id, 'dec')}
              onMouseUp={() => onMouseUp(category.id, 'dec')}
              onMouseLeave={() => onMouseUp(category.id, 'dec')}
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
              onTouchEnd={() => onTouchEnd(category.id, 'inc')}
              onMouseDown={() => onMouseDown(category.id, 'inc')}
              onMouseUp={() => onMouseUp(category.id, 'inc')}
              onMouseLeave={() => onMouseUp(category.id, 'inc')}
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
        
        {/* BODY - half-circle units and weekly balance indicator */}
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
            onClick={() => {}} // No longer used
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
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
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
