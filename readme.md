# NutriTrack

A mobile-first web application for tracking daily food consumption by category.

## Overview

NutriTrack helps users maintain dietary awareness through visual unit tracking with half-circles or quarter-pills. The app allows for tracking consumption across four food categories (Carbs, Proteins, Fats, Vegetables) with maximum unit limits that adapt based on the type of day.

![NutriTrack Screenshot](https://via.placeholder.com/350x600?text=NutriTrack+App)

## Features

- Visual representation of consumed units (half-circles or quarter-pills)
- Precise tracking with 0.5 or 0.25 unit increments (configurable)
- Simple increment/decrement controls for each category
- Automatic daily reset at midnight
- Three day types with different nutritional limits:
  - Normal Day (🍃): Standard nutritional limits
  - Sport Day (🚴): Higher protein and carb limits for workout days
  - Free Meal Day (🍰): No maximum limits
- 14-day history tracking with complete calendar coverage
- Edit any day within the history limit, even days you missed
- Weekly balance tracking showing over/under consumption
- Customizable food category limits via URL parameters
- Configurable increment precision via URL parameters
- Dark mode support with system preference detection
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
│   │   ├── DayTypeSelector.js // Day type toggle component
│   │   └── DarkModeToggle.js  // Dark mode toggle component
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
4. Use the `+` and `-` buttons to track your consumption for each category (each click adds/subtracts by the configured increment)
5. The app automatically saves your progress in browser cookies
6. View your 14-day history by clicking the "Show History" button
7. Edit past days by clicking the pencil icon next to each day in history view
8. Use the slider to reset today's tracking if needed
9. Toggle dark mode using the switch below the reset slider

## Dark Mode

NutriTrack includes a dark mode feature for comfortable usage in low-light conditions:

- The app automatically detects your system preference on first load
- You can manually toggle between light and dark modes using the switch below the reset slider
- Your preference is saved between sessions
- Dark mode applies to all screens (tracking, history, editing)

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

## URL Parameters

NutriTrack supports customizing the application through URL parameters:

### Unit Increment Parameter

Use the `i` parameter to set the increment step size:

```
?i=25
```

This sets the increment value to 0.25 units (instead of the default 0.5 units). This affects:
- The step size when using the +/- buttons
- The visual representation of units (quarter-pills instead of half-circles)
- Number formatting throughout the app
- Weekly balance calculation granularity

### Food Category Customization

Use the `u` parameter with an ultra-compact format to customize the food category limits:

```
?u=25-35-10-25
```

This example sets:
- Carbs: 2.5 units
- Proteins: 3.5 units
- Fats: 1.0 unit
- Vegetables: 2.5 units

All values are multiplied by 10 to eliminate decimal points (2.5 becomes 25).

### Setting Different Sport Day Values

To set different values for Sport Day:

```
?u=25-35-10-25-45-30-10-25
```

The first four values are for Normal Day, the next four are for Sport Day.

### Combining Parameters

You can combine URL parameters to customize both increment size and food category limits:

```
?u=25-35-10-25&i=25
```

This sets both custom food category limits and 0.25 unit increments.

### Notes

- If only 4 values are provided in the `u` parameter, they will be used for both Normal and Sport days
- Free Meal Day always has unlimited units, but will display empty unit indicators based on the Normal Day values
- If no URL parameters are provided, default configuration is used
- URL parameters do not persist between sessions

## History and Weekly Balance

### History Tracking

The app maintains a complete 14-day history, allowing you to:
- See all days within the history limit, even if you didn't use the app on those days
- Retroactively update entries for days you missed
- Visually distinguish between days with and without data

### Weekly Balance

Weekly balance indicators show how your consumption compares to your goals:
- Only considers days prior to today (not counting today's consumption)
- Shows surplus or deficit for each food category
- Only appears when there is a meaningful difference
- Takes into account your day types (Normal/Sport/Free)

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

Current Version: 1.10.0

## Changelog

### v1.10.0
- Added support for 0.25 unit increments via URL parameter (?i=25)
- Implemented quarter-pill visual indicators for 0.25 increment mode
- Enhanced number formatting to show appropriate decimal places (2.25, 2.5, 2.75)
- Updated weekly balance indicators to support 0.25 increment granularity
- Improved unit formatting consistency throughout the app

### v1.9.0
- Added complete history tracking with automatic entries for all past days
- Users can now retroactively add consumption data for any day within the history limit
- Enhanced history view to visually distinguish days with recorded data
- Improved weekly balance calculation to ignore unedited days
- Added helpful indicators for days without data in history view

### v1.8.3
- Modified weekly balance tracking to exclude the current day from calculations
- Enhanced weekly balance indicators to only show meaningful surpluses or deficits
- Updated tooltips to clarify that calculations exclude today's consumption
- Optimized weekly balance logic for better performance and accuracy
- Fixed bug in date range calculation for weekly summary

### v1.8.2
- Added weekly balance tracking for all food categories
- Implemented visual indicators showing over/under consumption for the week
- Added tooltips with detailed information about weekly consumption patterns
- Improved UI for better clarity on consumption tracking

### v1.8.1
- Fixed issues with dark mode compatibility 
- Enhanced accessibility for screen readers
- Improved touch controls for mobile devices
- Fixed minor visual glitches in history view

### v1.8.0
- Added weekly summary view with consumption trends
- Enhanced data visualization for day types
- Improved history editing capabilities
- Added support for importing/exporting user data
- Fixed several UI/UX issues for better usability

### v1.7.0
- Added dark mode support
- Implemented automatic system preference detection
- Added dark mode toggle switch below reset slider
- Enhanced UI for better contrast and readability in dark mode

### v1.6.1
- Removed share configuration button
- Streamlined user interface

### v1.6.0
- Added URL parameter support for customizing food category limits
- Improved handling of different day type configurations
- Added documentation for URL parameter usage

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
