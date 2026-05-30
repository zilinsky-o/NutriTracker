// WeightInput component
// Uses type="text" + inputMode="decimal" for reliable decimal keyboard on iOS and Android.
// Manages a local display string so intermediate values like "75." don't get cleared while typing.

const WeightInput = ({ value, onChange }) => {
  const [displayValue, setDisplayValue] = React.useState(
    value !== null && value !== undefined ? String(value) : ''
  );

  // Sync display when the external value changes (day change, reset, edit open)
  React.useEffect(() => {
    setDisplayValue(value !== null && value !== undefined ? String(value) : '');
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    // Allow: empty, digits only, or digits with one decimal point and up to one digit after
    if (raw !== '' && !/^\d*\.?\d{0,1}$/.test(raw)) return;
    setDisplayValue(raw);
    if (raw === '' || raw === '.') {
      onChange(null);
    } else if (!raw.endsWith('.')) {
      const num = parseFloat(raw);
      if (!isNaN(num)) onChange(num);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      pattern="[0-9]*\.?[0-9]?"
      value={displayValue}
      onChange={handleChange}
      placeholder="—"
      className="w-24 text-right text-lg font-semibold bg-transparent border-b-2 border-gray-200 dark:border-gray-600 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-gray-700 dark:text-gray-300"
    />
  );
};
