// Day Type Selector Component
// Provides a segmented control to select the day type

const DayTypeSelector = ({ currentDayType, onChange }) => {
  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 transition-colors">
        {DAY_TYPES.map(dayType => (
          <button
            key={dayType.id}
            onClick={() => onChange(dayType.id)}
            className={`w-12 h-12 flex items-center justify-center rounded-md text-xl transition-colors ${
              currentDayType === dayType.id
                ? 'bg-white dark:bg-gray-800 shadow-sm'
                : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            title={dayType.name}
            aria-label={dayType.name}
          >
            <span role="img" aria-label={dayType.name}>
              {dayType.icon}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
