# NutriTrack

A mobile-first web application for tracking daily food consumption by category.

## Overview

NutriTrack helps users maintain dietary awareness through visual unit tracking with half-circles. The app allows for tracking consumption across four food categories (Carbs, Proteins, Fats, Vegetables) with maximum unit limits.

![NutriTrack Screenshot](https://via.placeholder.com/350x600?text=NutriTrack+App)

## Features

- Visual half-circle representation of consumed units
- Simple increment/decrement controls for each category
- Automatic daily reset at midnight
- 7-day history tracking
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
│   │   └── ResetSlider.js     // Slider reset component
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
3. Use the `+` and `-` buttons to track your consumption for each category
4. The app automatically saves your progress in browser cookies
5. View your 7-day history by clicking the "Show History" button
6. Use the slider to reset today's tracking if needed

## Development

This project is structured in a way that each component and functional area is separated into its own file, making it easier to maintain and extend.

### Adding a New Food Category

To add a new food category, edit `js/config.js` and add a new entry to the `FOOD_CATEGORIES` array:

```javascript
{ 
  id: 'newCategoryId', 
  name: 'New Category', 
  maxUnits: 4, 
  color: '#HEXCOLOR', 
  bgColor: '#HEXCOLOR-LIGHT' 
}
```

## License

MIT

## Version

Current Version: 1.2.0