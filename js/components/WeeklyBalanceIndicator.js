// Weekly Balance Indicator Component

// Define constants for weekly balance status
const WEEKLY_BALANCE_STATUS = {
  EXCESS: 'excess',
  UNDER: 'under',
  ON_TRACK: 'on-track'
};

// Threshold for determining if consumption is "on track"
const BALANCE_THRESHOLD = 0.01;

// The Weekly Balance Indicator component
const WeeklyBalanceIndicator = ({ category, balance }) => {
  // Skip rendering if balance is null/undefined (not enough data)
  if (balance === null || balance === undefined) {
    return null;
  }
  
  // Determine status based on balance
  const getStatus = (diff) => {
    if (Math.abs(diff) < BALANCE_THRESHOLD) { // Only consider exact 0 as on-track
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
    // Format the difference value for display in the tooltip
    const formattedDiff = formatDifference(Math.abs(diff)).replace('+', '');
    
    switch(statusType) {
      case WEEKLY_BALANCE_STATUS.EXCESS:
        return `You're ${formattedDiff} units over on ${categoryName.toLowerCase()} this week. Consider reducing intake.`;
      case WEEKLY_BALANCE_STATUS.UNDER:
        return `You're ${formattedDiff} units under on ${categoryName.toLowerCase()} this week. Try to increase intake.`;
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
