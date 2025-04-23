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
  onDayTypeChange
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
      <div className="bg-indigo-50 p-3 mb-4 rounded-lg border border-indigo-100">
        <div className="flex justify-between items-center">
          <h2 className="font-medium text-indigo-800">
            Editing: {formatDate(day.date)}
          </h2>
          <button
            onClick={onCancel}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
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
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
