// App configuration values

// Define day types
const DAY_TYPES = [
  { 
    id: 'normal', 
    name: 'Normal Day', 
    icon: '🍃', // Leaf
    description: 'Regular nutritional limits'
  },
  { 
    id: 'sport', 
    name: 'Sport Day', 
    icon: '🚴', // Bicycle
    description: 'Higher protein and carb limits for intensive workouts'
  },
  { 
    id: 'free', 
    name: 'Free Meal Day', 
    icon: '🍰', // Cake
    description: 'No limits on consumption'
  }
];

// Define food categories with their properties for different day types
const FOOD_CATEGORIES = [
  { 
    id: 'carbs', 
    name: 'Carbs', 
    maxUnits: {
      normal: 5,
      sport: 9,
      free: Infinity
    }, 
    color: '#E99D42', 
    bgColor: '#FFEFD6' 
  },
  { 
    id: 'proteins', 
    name: 'Proteins', 
    maxUnits: {
      normal: 7,
      sport: 6,
      free: Infinity
    }, 
    color: '#4C72B0', 
    bgColor: '#E1EAFA' 
  },
  { 
    id: 'fats', 
    name: 'Fats', 
    maxUnits: {
      normal: 2,
      sport: 2,
      free: Infinity
    }, 
    color: '#DD6E6E', 
    bgColor: '#FBECEC' 
  },
  { 
    id: 'vegetables', 
    name: 'Vegetables', 
    maxUnits: {
      normal: 5,
      sport: 5,
      free: Infinity
    }, 
    color: '#55AD7A', 
    bgColor: '#E7F5EE' 
  }
];

// App version
const APP_VERSION = '1.3.0';

// Maximum days to keep in history
const MAX_HISTORY_DAYS = 7;

// Helper to get default state for a single day
const getDefaultDayState = () => ({
  carbs: 0,
  proteins: 0,
  fats: 0,
  vegetables: 0,
  dayType: 'normal', // Default day type
  date: new Date().toISOString().split('T')[0] // Store current date in YYYY-MM-DD format
});
