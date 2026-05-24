// Weight Trend View Component
// Displays a chart of weekly average weights with weekly / 4-week toggle

const WeightTrendView = ({ weeklyAverages, currentWeekAvg, isDarkMode }) => {
  const chartRef = React.useRef(null);
  const chartInstanceRef = React.useRef(null);
  const [viewMode, setViewMode] = React.useState('weekly');

  // Format a week start date for axis labels
  const formatWeekLabel = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Build chart data based on view mode
  const getChartData = () => {
    // Merge stored averages with current week's running average
    const all = [...weeklyAverages];
    if (currentWeekAvg) {
      const idx = all.findIndex(w => w.d === currentWeekAvg.d);
      if (idx >= 0) all[idx] = currentWeekAvg;
      else all.unshift(currentWeekAvg);
    }

    // Sort chronologically oldest → newest for the chart
    const sorted = all.sort((a, b) => a.d.localeCompare(b.d));

    if (viewMode === 'weekly') {
      return {
        labels: sorted.map(w => formatWeekLabel(w.d)),
        data: sorted.map(w => w.avg),
        isCurrent: sorted.map(w => !!w.isCurrent)
      };
    }

    // 4-week grouping: weighted average across each block of 4 weeks
    const groups = [];
    for (let i = 0; i < sorted.length; i += 4) {
      const chunk = sorted.slice(i, i + 4);
      const totalWeighted = chunk.reduce((sum, w) => sum + w.avg * w.n, 0);
      const totalDays = chunk.reduce((sum, w) => sum + w.n, 0);
      groups.push({
        label: formatWeekLabel(chunk[0].d),
        avg: totalDays > 0 ? Math.round((totalWeighted / totalDays) * 10) / 10 : null,
        isCurrent: chunk.some(w => w.isCurrent)
      });
    }

    return {
      labels: groups.map(g => g.label),
      data: groups.map(g => g.avg),
      isCurrent: groups.map(g => g.isCurrent)
    };
  };

  React.useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const { labels, data, isCurrent } = getChartData();
    if (!data.length || data.every(d => d === null)) return;

    const textColor = isDarkMode ? '#9CA3AF' : '#6B7280';
    const gridColor = isDarkMode ? '#374151' : '#E5E7EB';

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Avg Weight (kg)',
          data,
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          borderWidth: 2,
          pointRadius: isCurrent.map(c => c ? 5 : 4),
          pointBackgroundColor: isCurrent.map(c => c ? 'rgba(79,70,229,0.3)' : '#4F46E5'),
          pointBorderColor: '#4F46E5',
          pointBorderWidth: isCurrent.map(c => c ? 2 : 0),
          tension: 0.3,
          fill: true,
          spanGaps: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const idx = ctx.dataIndex;
                const suffix = isCurrent[idx] ? ' (this week so far)' : '';
                return `${Number(ctx.parsed.y).toFixed(1)} kg${suffix}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: textColor, maxRotation: 45 },
            grid: { color: gridColor }
          },
          y: {
            ticks: {
              color: textColor,
              callback: (v) => `${Number(v).toFixed(1)} kg`
            },
            grid: { color: gridColor }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [weeklyAverages, currentWeekAvg, viewMode, isDarkMode]);

  const { data } = getChartData();
  const hasData = data.some(d => d !== null);

  return (
    <div>
      {/* Weekly / 4-Week toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 transition-colors">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              viewMode === 'weekly'
                ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-800 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode('4week')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              viewMode === '4week'
                ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-800 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            4-Week
          </button>
        </div>
      </div>

      {hasData ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <canvas ref={chartRef} />
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
            Hollow point = current week (in progress)
          </p>
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          No weight data yet. Log your weight daily to see trends here.
        </div>
      )}
    </div>
  );
};
