// Food Category Component
// Renders a single food category with controls and visual representation

// Render half circles for a food category
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
    ? Math.max(category.maxUnits.normal, currentUnits)
    : maxUnits;
  
  const units = Array.from({ length: displayMax }, (_, index) => {
    const isFilled = index < fullUnits;
    
    return (
      <div 
        key={`unit-${index}`} 
        className="w-5 h-5 rounded-l-full"
        style={{ 
          backgroundColor: isFilled ? category.color : category.bgColor,
          margin: '0 2px'
        }}
      />
    );
  });
  
  // Only add excess units if not a free meal day
  const excess = !isFreeMealDay ? Array.from({ length: excessUnits }, (_, index) => {
    return (
      <div 
        key={`excess-${index}`} 
        className="w-5 h-5 rounded-l-full"
        style={{ 
          backgroundColor: '#FF3B30',
          margin: '0 2px'
        }}
      />
    );
  }) : [];
  
  return [...units, ...excess];
};

// Food Category component
const FoodCategory = ({ 
  category, 
  unitCount, 
  dayType,
  activeButton, 
  onTouchStart, 
  onTouchEnd, 
  onClick 
}) => {
  const maxUnits = category.maxUnits[dayType];
  const isFreeMealDay = dayType === 'free';
  
  // Only apply exceeded and maxed styling for normal and sport days
  const isExceeded = !isFreeMealDay && isFinite(maxUnits) && unitCount > maxUnits;
  const isMaxed = !isFreeMealDay && unitCount === maxUnits;
  
  let labelColor = 'text-gray-700';
  if (isExceeded) {
    labelColor = 'text-red-500';
  } else if (isMaxed) {
    labelColor = 'text-blue-500';
  }
  
  return (
    <div className="mb-4 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <h2 className={`text-lg font-semibold ${labelColor}`}>
          {category.name} ({unitCount}{isFreeMealDay ? '' : `/${maxUnits}`})
        </h2>
        <div className="flex space-x-2">
          <button 
            onTouchStart={() => onTouchStart(category.id, 'dec')}
            onTouchEnd={onTouchEnd}
            onClick={() => onClick(category.id, 'dec')}
            disabled={unitCount <= 0}
            className={`w-12 h-12 flex items-center justify-center text-lg font-bold rounded-full focus:outline-none transition-colors duration-150 ${
              activeButton === `${category.id}-dec` 
                ? 'bg-gray-300 text-gray-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-40`}
            aria-label={`Decrease ${category.name}`}
          >
            -
          </button>
          <button 
            onTouchStart={() => onTouchStart(category.id, 'inc')}
            onTouchEnd={onTouchEnd}
            onClick={() => onClick(category.id, 'inc')}
            className={`w-12 h-12 flex items-center justify-center text-lg font-bold rounded-full focus:outline-none transition-colors duration-150 ${
              activeButton === `${category.id}-inc` 
                ? 'bg-gray-300 text-gray-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-label={`Increase ${category.name}`}
          >
            +
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap space-x-1 py-2 hide-scrollbar">
        {renderHalfCircles(category.id, category, { [category.id]: unitCount, dayType })}
      </div>
    </div>
  );
};
