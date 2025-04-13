// Day Type Selector Component
// Provides a segmented control to select the day type

const DayTypeSelector = ({ currentDayType, onChange }) => {
  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex bg-gray-200 rounded-lg p-1">
        {DAY_TYPES.map(dayType => (
          <button
            key={dayType.id}
            onClick={() => onChange(dayType.id)}
            className={`w-12 h-12 flex items-center justify-center rounded-md text-xl ${
              currentDayType === dayType.id
                ? 'bg-white shadow-sm'
                : 'bg-transparent text-gray-600 hover:bg-gray-100'
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
