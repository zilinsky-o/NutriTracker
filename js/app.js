// Main application component

// The main NutriTrack component with its functionality
const NutriTrack = () => {
  // Set up state with history
  const [appState, setAppState] = React.useState(loadFromCookie());
  const [sliderValue, setSliderValue] = React.useState(0);
  const [isTouchActive, setIsTouchActive] = React.useState(false);
  const [activeButton, setActiveButton] = React.useState(null);
  const [showHistory, setShowHistory] = React.useState(false);
  const [editingDay, setEditingDay] = React.useState(null);
  const [isDarkMode, setIsDarkMode] = React.useState(loadDarkModeFromCookie());
  
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
    
    // Round to nearest half unit to avoid floating point issues
    newValue = Math.round(newValue * 2) / 2;
    
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
    if (day) {
      // We're editing a historical day
      updateUnitCount(categoryId, (day[categoryId] || 0) + UNIT_INCREMENT, day);
    } else {
      // We're updating the current day
      updateUnitCount(categoryId, unitCounts[categoryId] + UNIT_INCREMENT);
    }
  };

  const decrementUnit = (categoryId, day = null) => {
    if (day) {
      // We're editing a historical day
      if ((day[categoryId] || 0) >= UNIT_INCREMENT) {
        updateUnitCount(categoryId, day[categoryId] - UNIT_INCREMENT, day);
      }
    } else {
      // We're updating the current day
      if (unitCounts[categoryId] >= UNIT_INCREMENT) {
        updateUnitCount(categoryId, unitCounts[categoryId] - UNIT_INCREMENT);
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
  
  const handleTouchStart = (id, action, day = null) => {
    setActiveButton(`${id}-${action}`);
    
    if (action === 'inc') {
      incrementUnit(id, day);
    } else if (action === 'dec') {
      decrementUnit(id, day);
    }
  };
  
  const handleTouchEnd = () => {
    setActiveButton(null);
  };
  
  const handleButtonClick = (id, action, day = null) => {
    if (isTouchActive) return;
    
    if (action === 'inc') {
      incrementUnit(id, day);
    } else if (action === 'dec') {
      decrementUnit(id, day);
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
            onClick={handleButtonClick}
            onDayTypeChange={(newType) => handleDayTypeChange(newType, editingDay)}
          />
        ) : showHistory ? (
          // History view
          <HistoryView 
            history={appState.history} 
            onEditDay={startEditingDay}
          />
        ) : (
          // Today's tracking
          FOOD_CATEGORIES.map(category => (
            <FoodCategory
              key={category.id}
              category={category}
              unitCount={unitCounts[category.id]}
              dayType={unitCounts.dayType || 'normal'}
              activeButton={activeButton}
              onTouchStart={(id, action) => handleTouchStart(id, action)}
              onTouchEnd={handleTouchEnd}
              onClick={(id, action) => handleButtonClick(id, action)}
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
