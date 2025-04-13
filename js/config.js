// App configuration values

// Define food categories with their properties
const FOOD_CATEGORIES = [
  { id: 'carbs', name: 'Carbs', maxUnits: 5, color: '#E99D42', bgColor: '#FFEFD6' },
  { id: 'proteins', name: 'Proteins', maxUnits: 7, color: '#4C72B0', bgColor: '#E1EAFA' },
  { id: 'fats', name: 'Fats', maxUnits: 2, color: '#DD6E6E', bgColor: '#FBECEC' },
  { id: 'vegetables', name: 'Vegetables', maxUnits: 5, color: '#55AD7A', bgColor: '#E7F5EE' }
];

// App version
const APP_VERSION = '1.2.0';

// Maximum days to keep in history
const MAX_HISTORY_DAYS = 7;

// Helper to get default state for a single day
const getDefaultDayState = () => ({
  carbs: 0,
  proteins: 0,
  fats: 0,
  vegetables: 0,
  date: new Date().toISOString().split('T')[0] // Store current date in YYYY-MM-DD format
});
