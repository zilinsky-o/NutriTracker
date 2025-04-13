// Main application component

// The main NutriTrack component with its functionality
const NutriTrack = () => {
  // Set up state with history
  const [appState, setAppState] = React.useState(loadFromCookie());
  const [sliderValue, setSliderValue] = React.useState(0);
  const [isTouchActive, setIsTouchActive] = React.useState(false);
  const [activeButton, setActiveButton] = React.useState(null);
  const [showHistory, setShowHistory] = React.useState(false);
  
  // Shorthand for current day's unit counts
  const unitCounts = appState.currentDay;
  
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
  const updateUnitCount = (categoryId, newValue) => {
    if (newValue < 0) return;
    
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
  };
  
  const incrementUnit = (categoryId) => {
    updateUnitCount(categoryId, unitCounts[categoryId] + 1);
  };

  const decrementUnit = (categoryId) => {
    if (unitCounts[categoryId] > 0) {
      updateUnitCount(categoryId, unitCounts[categoryId] - 1);
    }
  };
  
  const handleDayTypeChange = (newDayType) => {
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
  
  const handleTouchStart = (id, action) => {
    setActiveButton(`${id}-${action}`);
    
    if (action === 'inc') {
      incrementUnit(id);
    } else if (action === 'dec' && unitCounts[id] > 0) {
      decrementUnit(id);
    }
  };
  
  const handleTouchEnd = () => {
    setActiveButton(null);
  };
  
  const handleButtonClick = (id, action) => {
    if (isTouchActive) return;
    
    if (action === 'inc') {
      incrementUnit(id);
    } else if (action === 'dec' && unitCounts[id] > 0) {
      decrementUnit(id);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto p-4 bg-white shadow-lg sm:my-4 sm:rounded-xl no-select">
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">NutriTrack</h1>
        <p className="text-gray-600 text-sm mb-2">Track your daily food intake</p>
        
        {/* Day Type Selector */}
        {!showHistory && (
          <DayTypeSelector 
            currentDayType={unitCounts.dayType || 'normal'} 
            onChange={handleDayTypeChange}
          />
        )}
        
        <div className="flex justify-center mt-2">
          <button 
            onClick={toggleHistory}
            className="px-4 py-1 text-sm bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>
      </header>
      
      <main className="flex-grow">
        {!showHistory ? (
          // Today's tracking
          FOOD_CATEGORIES.map(category => (
            <FoodCategory
              key={category.id}
              category={category}
              unitCount={unitCounts[category.id]}
              dayType={unitCounts.dayType || 'normal'}
              activeButton={activeButton}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={handleButtonClick}
            />
          ))
        ) : (
          // History view
          <HistoryView history={appState.history} />
        )}
      </main>
      
      {!showHistory && (
        <footer className="mt-4 mb-4">
          <ResetSlider
            value={sliderValue}
            onChange={handleSliderChange}
          />
        </footer>
      )}
      
      <div className="text-center text-xs text-gray-400 mt-4">
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
