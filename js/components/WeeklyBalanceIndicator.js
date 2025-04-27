// Add this to js/components/WeeklyBalanceIndicator.js

// Define constants for weekly balance status
const WEEKLY_BALANCE_STATUS = {
  EXCESS: 'excess',
  UNDER: 'under',
  ON_TRACK: 'on-track'
};

// Threshold for determining if consumption is "on track" (±0.5 units)
const BALANCE_THRESHOLD = 0.5;

// Weekly Balance Indicator component
const WeeklyBalanceIndicator = ({ category, balance }) => {
  // Skip rendering if balance is null/undefined (not enough data)
  if (balance === null || balance === undefined) {
    return null;
  }
  
  // Determine status based on balance
  const getStatus = (diff) => {
    if (Math.abs(diff) <= BALANCE_THRESHOLD) {
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
  
  // Format the difference value for display
  const formatDifference = (diff) => {
    if (Math.abs(diff) <= BALANCE_THRESHOLD) return '';
    
    // Round to nearest 0.5 to match the app's unit increment
    const rounded = Math.round(diff * 2) / 2;
    return rounded > 0 ? `+${rounded.toFixed(1)}` : rounded.toFixed(1);
  };
  
  // Get tooltip text based on status
  const getTooltipText = (statusType, diff, categoryName) => {
    switch(statusType) {
      case WEEKLY_BALANCE_STATUS.EXCESS:
        return `You're ${Math.abs(diff).toFixed(1)} units over on ${categoryName.toLowerCase()} this week. Consider reducing intake.`;
      case WEEKLY_BALANCE_STATUS.UNDER:
        return `You're ${Math.abs(diff).toFixed(1)} units under on ${categoryName.toLowerCase()} this week. Try to increase intake.`;
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
