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

// Parse URL parameters for configuration
const parseUrlParameters = () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Get unit increment value from URL (i=25 for 0.25, default is 0.5)
  const incrementParam = urlParams.get('i');
  let unitIncrement = 0.5; // Default
  if (incrementParam === '25') {
    unitIncrement = 0.25;
  }
  
  // Get food categories customization
  const unitsParam = urlParams.get('u');
  let foodCategories = DEFAULT_FOOD_CATEGORIES;
  
  if (unitsParam) {
    const values = unitsParam.split('-').map(val => parseInt(val, 10) / 10);
    
    // Validate if we have at least 4 values for normal day
    if (values.length >= 4 && !values.some(isNaN)) {
      // Create a copy of the default categories
      const customCategories = JSON.parse(JSON.stringify(DEFAULT_FOOD_CATEGORIES));
      
      // Update normal day values for all categories
      for (let i = 0; i < 4; i++) {
        if (i < customCategories.length) {
          customCategories[i].maxUnits.normal = values[i];
        }
      }
      
      // If sport day values are provided, update them too
      if (values.length >= 8) {
        for (let i = 0; i < 4; i++) {
          if (i < customCategories.length) {
            customCategories[i].maxUnits.sport = values[i + 4];
          }
        }
      } else {
        // Use normal day values for sport day if not explicitly provided
        for (let i = 0; i < customCategories.length; i++) {
          customCategories[i].maxUnits.sport = customCategories[i].maxUnits.normal;
        }
      }
      
      foodCategories = customCategories;
    } else {
      console.warn('Invalid URL parameters format for food categories, using default configuration');
    }
  }
  
  return {
    unitIncrement,
    foodCategories
  };
};

// Default food categories with their properties for different day types
const DEFAULT_FOOD_CATEGORIES = [
  { 
    id: 'carbs', 
    name: 'Carbs', 
    maxUnits: {
      normal: 2.5,
      sport: 4.5,
      free: Infinity
    }, 
    color: '#E99D42', 
    bgColor: '#FFEFD6' 
  },
  { 
    id: 'proteins', 
    name: 'Proteins', 
    maxUnits: {
      normal: 3.5,
      sport: 3.0,
      free: Infinity
    }, 
    color: '#4C72B0', 
    bgColor: '#E1EAFA' 
  },
  { 
    id: 'fats', 
    name: 'Fats', 
    maxUnits: {
      normal: 1.0,
      sport: 1.0,
      free: Infinity
    }, 
    color: '#DD6E6E', 
    bgColor: '#FBECEC' 
  },
  { 
    id: 'vegetables', 
    name: 'Vegetables', 
    maxUnits: {
      normal: 2.5,
      sport: 2.5,
      free: Infinity
    }, 
    color: '#55AD7A', 
    bgColor: '#E7F5EE' 
  }
];

// Get the configuration from URL parameters
const CONFIG = parseUrlParameters();

// Get the final food categories with any URL parameter overrides applied
const FOOD_CATEGORIES = CONFIG.foodCategories;

// App version
const APP_VERSION = '1.10.0';

// Current data schema version for migrations
const DATA_SCHEMA_VERSION = 3;

// Increment size for unit steps
const UNIT_INCREMENT = CONFIG.unitIncrement;

// Maximum days to keep in history
const MAX_HISTORY_DAYS = 14;

// Helper to get default state for a single day
const getDefaultDayState = () => ({
  carbs: 0,
  proteins: 0,
  fats: 0,
  vegetables: 0,
  dayType: 'normal', // Default day type
  date: new Date().toISOString().split('T')[0], // Store current date in YYYY-MM-DD format
  schemaVersion: DATA_SCHEMA_VERSION, // Track schema version for migrations
  hasBeenEdited: false // Flag to track if this day has been explicitly edited
});
