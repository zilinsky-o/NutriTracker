// Add this to js/weeklyBalance.js
// Utility functions for calculating weekly balance

// Helper function to get the start date (Sunday) of the week containing the given date
const getWeekStartDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate how many days to go back to reach Sunday
  const daysToSubtract = day;
  
  // Create new date for Sunday
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - daysToSubtract);
  
  // Return in YYYY-MM-DD format
  return sunday.toISOString().split('T')[0];
};

// Helper function to get the end date (Saturday) of the week containing the given date
const getWeekEndDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate how many days to add to reach Saturday
  const daysToAdd = 6 - day;
  
  // Create new date for Saturday
  const saturday = new Date(date);
  saturday.setDate(date.getDate() + daysToAdd);
  
  // Return in YYYY-MM-DD format
  return saturday.toISOString().split('T')[0];
};

// Format date range for display
const formatWeekDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startMonth = start.toLocaleString('default', { month: 'short' });
  const endMonth = end.toLocaleString('default', { month: 'short' });
  
  const startDay = start.getDate();
  const endDay = end.getDate();
  
  // If same month, don't repeat month
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
};

// Calculate the weekly balance for all categories
const calculateWeeklyBalance = (history, today = new Date().toISOString().split('T')[0]) => {
  // Get current week's start and end dates
  const weekStart = getWeekStartDate(today);
  const weekEnd = getWeekEndDate(today);
  
  // Filter history to only include days in current week that are not in the future
  const weekHistory = history.filter(day => {
    return day.date >= weekStart && day.date <= weekEnd && day.date <= today;
  });
  
  // Initialize results
  const results = {
    weekDateRange: formatWeekDateRange(weekStart, weekEnd),
    categories: {}
  };
  
  // If no history for this week, return empty results
  if (weekHistory.length === 0) {
    return results;
  }
  
  // For each category, calculate the balance
  FOOD_CATEGORIES.forEach(category => {
    const categoryId = category.id;
    
    // Calculate actual consumption for the week so far
    const actualConsumption = weekHistory.reduce((sum, day) => {
      return sum + (day[categoryId] || 0);
    }, 0);
    
    // Calculate planned consumption based on day types
    const plannedConsumption = weekHistory.reduce((sum, day) => {
      const dayType = day.dayType || 'normal';
      
      // For free meal days, count the consumption as planned
      // For other day types, use the maxUnits value
      if (dayType === 'free') {
        return sum + (day[categoryId] || 0);
      } else {
        return sum + category.maxUnits[dayType];
      }
    }, 0);
    
    // Calculate the difference (negative means under, positive means over)
    const difference = actualConsumption - plannedConsumption;
    
    // Store results
    results.categories[categoryId] = {
      actual: actualConsumption,
      planned: plannedConsumption,
      difference: difference
    };
  });
  
  return results;
};
