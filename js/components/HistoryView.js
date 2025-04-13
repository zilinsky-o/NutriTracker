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

// History View component
const HistoryView = ({ history }) => {
  return (
    <div className="space-y-4">
      {history.map((day, index) => (
        <div key={day.date} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-800">
              {formatDate(day.date)}
            </h3>
            <div 
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-lg"
              title={getDayTypeName(day.dayType || 'normal')}
            >
              <span role="img" aria-label={getDayTypeName(day.dayType || 'normal')}>
                {getDayTypeIcon(day.dayType || 'normal')}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {FOOD_CATEGORIES.map(category => {
              const dayType = day.dayType || 'normal';
              const maxUnits = category.maxUnits[dayType];
              const isFreeMealDay = dayType === 'free';
              
              return (
                <div key={`${day.date}-${category.id}`} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">{category.name}</div>
                  <div className="flex-grow flex flex-wrap space-x-1">
                    {renderHalfCircles(category.id, category, day)}
                  </div>
                  <div className="w-12 text-right text-sm font-medium" style={{ color: category.color }}>
                    {day[category.id] || 0}{isFreeMealDay ? '' : `/${maxUnits}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {history.length === 0 && (
        <div className="text-center text-gray-500 py-6">
          No history data available yet
        </div>
      )}
    </div>
  );
};
