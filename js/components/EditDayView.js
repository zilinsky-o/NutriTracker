// Edit Day View Component
// Allows editing of a historical day's data

const EditDayView = ({
  day,
  onSave,
  onCancel,
  activeButton,
  onTouchStart,
  onTouchEnd,
  onClick,
  onDayTypeChange,
  onWeightChange
}) => {
  // Format date nicely for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="bg-indigo-50 dark:bg-indigo-900 p-3 mb-4 rounded-lg border border-indigo-100 dark:border-indigo-800 transition-colors">
        <div className="flex justify-between items-center">
          <h2 className="font-medium text-indigo-800 dark:text-indigo-200">
            Editing: {formatDate(day.date)}
          </h2>
          <button
            onClick={onCancel}
            className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      
      {/* Day Type Selector */}
      <DayTypeSelector 
        currentDayType={day.dayType || 'normal'} 
        onChange={onDayTypeChange}
      />
      
      {/* Weight Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 transition-colors">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Weight</h2>
          <div className="flex items-center">
            <WeightInput value={day.weight} onChange={onWeightChange} />
            <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm font-medium">kg</span>
          </div>
        </div>
      </div>

      {/* Food Categories */}
      {FOOD_CATEGORIES.map(category => (
        <FoodCategory
          key={category.id}
          category={category}
          unitCount={day[category.id] || 0}
          dayType={day.dayType || 'normal'}
          activeButton={activeButton}
          onTouchStart={(id, action) => onTouchStart(id, action, day)}
          onTouchEnd={onTouchEnd}
          onClick={(id, action) => onClick(id, action, day)}
        />
      ))}
      
      {/* Save Button */}
      <div className="mt-4">
        <button
          onClick={onSave}
          className="w-full py-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
