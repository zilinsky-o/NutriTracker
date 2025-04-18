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
    ? Math.max(category.maxUnits.normal, Math.ceil(currentUnits))
    : maxUnits;
  
  // Each full unit is represented by 2 half-circles
  const totalHalfCircles = displayMax * 2;
  const fullHalfCircles = fullUnits * 2;
  
  // Handle half units by calculating how many full and half circles to show
  const fullCirclesToShow = Math.floor(fullHalfCircles / 2);
  const hasHalfCircle = fullHalfCircles % 2 === 1;
  
  // Create empty containers for all possible half circles
  const units = Array.from({ length: totalHalfCircles }, (_, index) => {
    const isLeft = index % 2 === 0;
    const pairIndex = Math.floor(index / 2);
    
    // Determine if this half-circle should be filled
    let isFilled;
    if (fullCirclesToShow > pairIndex) {
      // Both halves of this circle are filled
      isFilled = true;
    } else if (fullCirclesToShow === pairIndex && hasHalfCircle && isLeft) {
      // Only the left half of this circle is filled (for half units)
      isFilled = true;
    } else {
      // This half-circle is not filled
      isFilled = false;
    }
    
    return (
      <div 
        key={`half-${index}`} 
        className={`w-5 h-5 ${isLeft ? 'rounded-l-full' : 'rounded-r-full'}`}
        style={{ 
          backgroundColor: isFilled ? category.color : category.bgColor,
          margin: '0 0px'
        }}
      />
    );
  });
  
  // Handle excess units the same way
  const excessHalfCircles = excessUnits * 2;
  const excessFullCircles = Math.floor(excessHalfCircles / 2);
  const hasExcessHalf = excessHalfCircles % 2 === 1;
  
  const excess = !isFreeMealDay ? Array.from({ length: excessHalfCircles }, (_, index) => {
    const isLeft = index % 2 === 0;
    const pairIndex = Math.floor(index / 2);
    
    let isExcessFilled = false;
    if (excessFullCircles > pairIndex) {
      isExcessFilled = true;
    } else if (excessFullCircles === pairIndex && hasExcessHalf && isLeft) {
      isExcessFilled = true;
    }
    
    return (
      <div 
        key={`excess-half-${index}`} 
        className={`w-5 h-5 ${isLeft ? 'rounded-l-full' : 'rounded-r-full'}`}
        style={{ 
          backgroundColor: isExcessFilled ? '#FF3B30' : category.bgColor,
          margin: '0 0px'
        }}
      />
    );
  }) : [];
  
  // Group the half-circles into pairs for better visual display
  const pairedUnits = [];
  for (let i = 0; i < units.length; i += 2) {
    if (i + 1 < units.length) {
      pairedUnits.push(
        <div key={`pair-${i}`} className="flex" style={{ margin: '0 1px' }}>
          {units[i]}
          {units[i + 1]}
        </div>
      );
    } else {
      // Just in case there's an odd number
      pairedUnits.push(
        <div key={`pair-${i}`} className="flex" style={{ margin: '0 1px' }}>
          {units[i]}
        </div>
      );
    }
  }
  
  // Group excess half-circles the same way
  const pairedExcess = [];
  for (let i = 0; i < excess.length; i += 2) {
    if (i + 1 < excess.length) {
      pairedExcess.push(
        <div key={`excess-pair-${i}`} className="flex" style={{ margin: '0 1px' }}>
          {excess[i]}
          {excess[i + 1]}
        </div>
      );
    } else {
      pairedExcess.push(
        <div key={`excess-pair-${i}`} className="flex" style={{ margin: '0 1px' }}>
          {excess[i]}
        </div>
      );
    }
  }
  
  return [...pairedUnits, ...pairedExcess];
};

// Format the unit number with a single decimal place if needed
const formatUnitNumber = (value) => {
  // If it's a whole number, don't show the decimal
  if (value === Math.floor(value)) {
    return value.toString();
  }
  
  // Otherwise, show with 1 decimal place
  return value.toFixed(1);
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
  const isMaxed = !isFreeMealDay && Math.abs(unitCount - maxUnits) < 0.01; // Close enough to max
  
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
          {category.name} ({formatUnitNumber(unitCount)}
          {isFreeMealDay ? '' : `/${formatUnitNumber(maxUnits)}`})
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
      
      <div className="flex flex-wrap py-2 hide-scrollbar">
        {renderHalfCircles(category.id, category, { [category.id]: unitCount, dayType })}
      </div>
    </div>
  );
};
