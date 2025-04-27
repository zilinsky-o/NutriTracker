// Modify js/components/FoodCategory.js to include weekly balance indicator
// Make sure to add the WeeklyBalanceIndicator component import at the top of the file

// Food Category component - updated version with weekly balance indicator
const FoodCategory = ({ 
  category, 
  unitCount, 
  dayType,
  activeButton, 
  onTouchStart, 
  onTouchEnd, 
  onClick,
  weeklyBalance = null  // Add this prop
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
            onClick={() => onClick(category.id, 'dec')}
            disabled={unitCount <= 0}
            className={`w-12 h-12 flex items-center justify-center text-lg font-bold rounded-full focus:outline-none transition-colors duration-150 ${
              activeButton === `${category.id}-dec` 
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
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
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            aria-label={`Increase ${category.name}`}
          >
            +
          </button>
        </div>
      </div>
      
      {/* BODY - half circles and weekly balance indicator */}
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap py-2 hide-scrollbar">
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
