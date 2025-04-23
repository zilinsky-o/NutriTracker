# NutriTrack

A mobile-first web application for tracking daily food consumption by category.

## Overview

NutriTrack helps users maintain dietary awareness through visual unit tracking with half-circles. The app allows for tracking consumption across four food categories (Carbs, Proteins, Fats, Vegetables) with maximum unit limits that adapt based on the type of day.

![NutriTrack Screenshot](https://via.placeholder.com/350x600?text=NutriTrack+App)

## Features

- Visual half-circle representation of consumed units
- Precise tracking with 0.5 unit increments
- Simple increment/decrement controls for each category
- Automatic daily reset at midnight
- Three day types with different nutritional limits:
  - Normal Day (🍃): Standard nutritional limits
  - Sport Day (🚴): Higher protein and carb limits for workout days
  - Free Meal Day (🍰): No maximum limits
- 14-day history tracking
- Edit previous days' entries
- Mobile-optimized responsive design
- Color-coded feedback (blue at max, red for excess)
- Slider-based reset functionality
- Cookie-based persistent storage

## Project Structure

```
nutritrack/
│
├── index.html           // Main HTML container
├── css/
│   └── styles.css       // Extracted CSS styles
│
├── js/
│   ├── config.js        // Food categories and constants
│   ├── storage.js       // Cookie handling and state persistence
│   ├── components/
│   │   ├── FoodCategory.js    // Food category component
│   │   ├── HistoryView.js     // History display component
│   │   ├── EditDayView.js     // Day editing component
│   │   ├── ResetSlider.js     // Slider reset component
│   │   └── DayTypeSelector.js // Day type toggle component
│   └── app.js           // Main application logic
│
└── README.md            // Documentation
```

## Technologies Used

- React (via CDN)
- Tailwind CSS (via CDN)
- Browser cookies for local storage
- Babel for JSX compilation in browser

## How to Use

1. Clone the repository to your local machine
2. Open `index.html` in your browser
3. Select the appropriate day type using the icons at the top:
   - 🍃 Normal Day: Regular nutritional limits
   - 🚴 Sport Day: Higher protein and carb allowances
   - 🍰 Free Meal Day: No maximum limits
4. Use the `+` and `-` buttons to track your consumption for each category (each click adds/subtracts 0.5 units)
5. The app automatically saves your progress in browser cookies
6. View your 14-day history by clicking the "Show History" button
7. Edit past days by clicking the pencil icon next to each day in history view
8. Use the slider to reset today's tracking if needed

## Day Types Explained

### Normal Day (🍃)
- Carbs: 2.5 units
- Proteins: 3.5 units
- Fats: 1.0 unit
- Vegetables: 2.5 units

### Sport Day (🚴)
- Carbs: 4.5 units (increased)
- Proteins: 3.0 units
- Fats: 1.0 unit
- Vegetables: 2.5 units

### Free Meal Day (🍰)
- No limits on any category
- No red warning indicators

## Development

This project is structured in a way that each component and functional area is separated into its own file, making it easier to maintain and extend.

### Adding a New Food Category

To add a new food category, edit `js/config.js` and add a new entry to the `FOOD_CATEGORIES` array:

```javascript
{ 
  id: 'newCategoryId', 
  name: 'New Category', 
  maxUnits: {
    normal: 2.0,
    sport: 2.5,
    free: Infinity
  }, 
  color: '#HEXCOLOR', 
  bgColor: '#HEXCOLOR-LIGHT' 
}
```

## License

MIT

## Version

Current Version: 1.5.1

## Changelog

### v1.5.1
- Fixed issues with history day editing functionality
- Improved edit button styling and placement for better usability
- Fixed null value handling in historical data

### v1.5.0
- Extended history tracking from 7 to 14 days
- Added ability to edit historical days
- Improved data storage efficiency
- Bug fixes and performance improvements

### v1.4.0
- Initial documented version
- Visual half-circle tracking
- Three day types with different limits
- 7-day history tracking
