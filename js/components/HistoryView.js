// History View Component
// Displays historical data for food consumption over time

// Formatting a date for display
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dateStr === today.toISOString().split('T')[0]) {
    return 'Today';
  } else if (dateStr === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }
};

// Get the icon for a day type
const getDayTypeIcon = (dayType) => {
  const dayTypeObj = DAY_TYPES.find(dt => dt.id === dayType) || DAY_TYPES[0];
  return dayTypeObj.icon;
};

// Get day type name
const getDayTypeName = (dayType) => {
  const dayTypeObj = DAY_TYPES.find(dt => dt.id === dayType) || DAY_TYPES[0];
  return dayTypeObj.name;
};

// Format unit number for display
const formatUnitNumber = (value) => {
  if (value === undefined || value === null) return '0';
  
  // Convert to number to handle potential string inputs
  const num = Number(value);
  
  // If it's a whole number, don't show the decimal
  if (Math.floor(num) === num) {
    return num.toString();
  }
  
  // If we're in 0.25 increment mode
  if (UNIT_INCREMENT === 0.25) {
    // Special formatting for 0.25 increments
    // For numbers like 2.25, 2.5, 2.75, etc.
    
    // Check if the decimal part is 0.25, 0.5, or 0.75
    const decimal = Math.round((num - Math.floor(num)) * 100) / 100;
    
    if (decimal === 0.25 || decimal === 0.75) {
      // Return with two decimal places for 0.25/0.75
      return num.toFixed(2);
    } else if (decimal === 0.5) {
      // Return with one decimal place for 0.5
      return num.toFixed(1);
    }
  }
  
  // For 0.5 increment mode or other values, show with 1 decimal place
  return num.toFixed(1);
};

// Find the nearest previous day (higher index = older) that has a weight entry
const getPreviousWeight = (history, currentIndex) => {
  for (let i = currentIndex + 1; i < history.length; i++) {
    const w = history[i].weight;
    if (w !== null && w !== undefined) return w;
  }
  return null;
};

// History View component
const HistoryView = ({ history, onEditDay, isActiveDay, weeklyAverages, currentWeekAvg, isDarkMode }) => {
  const [activeTab, setActiveTab] = React.useState('daily');

  return (
    <div>
      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'daily'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setActiveTab('weight')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'weight'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Weight Trend
        </button>
      </div>

      {activeTab === 'weight' ? (
        <WeightTrendView
          weeklyAverages={weeklyAverages}
          currentWeekAvg={currentWeekAvg}
          isDarkMode={isDarkMode}
        />
      ) : (
    <div className="space-y-4">
      {history.map((day, index) => {
        // Check if day has been edited or has non-zero values
        const isActive = isActiveDay ? isActiveDay(day) : true;
        const prevWeight = getPreviousWeight(history, index);
        const weightDiff = (day.weight !== null && day.weight !== undefined && prevWeight !== null)
          ? parseFloat((day.weight - prevWeight).toFixed(1))
          : null;

        return (
          <div
            key={day.date}
            className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border transition-colors ${
              isActive 
                ? 'border-gray-100 dark:border-gray-700' 
                : 'border-gray-100 dark:border-gray-800 bg-opacity-80 dark:bg-opacity-80'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mr-2">
                  {formatDate(day.date)}
                </h3>
                <div 
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-lg"
                  title={getDayTypeName(day.dayType || 'normal')}
                >
                  <span role="img" aria-label={getDayTypeName(day.dayType || 'normal')}>
                    {getDayTypeIcon(day.dayType || 'normal')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onEditDay(day)}
                className="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition-colors"
                title="Edit day"
                aria-label="Edit day"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {FOOD_CATEGORIES.map(category => {
                const dayType = day.dayType || 'normal';
                const maxUnits = category.maxUnits[dayType];
                const isFreeMealDay = dayType === 'free';
                
                return (
                  <div key={`${day.date}-${category.id}`} className="flex items-center">
                    <div className="w-24 text-sm text-gray-600 dark:text-gray-400">{category.name}</div>
                    <div className="flex-grow flex flex-wrap">
                      {renderUnitIndicators(category.id, category, day)}
                    </div>
                    <div className="w-16 text-right text-sm font-medium" style={{ color: category.color }}>
                      {formatUnitNumber(day[category.id] || 0)}{isFreeMealDay ? '' : `/${formatUnitNumber(maxUnits)}`}
                    </div>
                  </div>
                );
              })}
              
              {/* Weight row */}
              <div className="flex items-center pt-2 mt-1 border-t border-gray-100 dark:border-gray-700">
                <div className="w-24 text-sm text-gray-600 dark:text-gray-400">Weight</div>
                <div className="flex-grow text-sm font-medium text-gray-700 dark:text-gray-300">
                  {day.weight !== null && day.weight !== undefined
                    ? `${parseFloat(day.weight).toFixed(1)} kg`
                    : <span className="text-gray-400 dark:text-gray-500">—</span>
                  }
                </div>
                {weightDiff !== null && (
                  <div className={`text-xs font-medium ${weightDiff > 0 ? 'text-red-500' : weightDiff < 0 ? 'text-green-500' : 'text-gray-400'}`}>
                    {weightDiff > 0 ? '▲' : weightDiff < 0 ? '▼' : '='}{' '}
                    {Math.abs(weightDiff).toFixed(1)} kg
                  </div>
                )}
              </div>

              {/* Show "no data" indicator for unedited days with all zeros */}
              {!isActive && (
                <div className="w-full text-center text-xs italic text-gray-500 dark:text-gray-400 mt-2">
                  No data for this day - tap edit to add
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {history.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-6">
          No history data available yet
        </div>
      )}
    </div>
      )}
    </div>
  );
};
