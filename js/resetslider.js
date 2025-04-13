// Reset Slider Component
// Provides a slider to reset tracking data

const ResetSlider = ({ value, onChange }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
      <p className="text-center text-gray-600 mb-3 text-sm">Slide to reset today's tracking</p>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={onChange}
          className="w-full h-8 rounded-full outline-none"
          style={{
            background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`,
          }}
        />
        <div 
          className="absolute top-0 left-0 h-8 rounded-full pointer-events-none"
          style={{
            width: `${value}%`,
            background: value > 95 ? '#4F46E5' : '#9CA3AF',
            transition: 'background-color 0.2s ease'
          }}
        />
      </div>
      <p className="text-center text-xs text-gray-500 mt-2">
        {value > 95 ? 'Release to reset' : 'Slide all the way to reset'}
      </p>
    </div>
  );
};