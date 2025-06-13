import React from 'react';

interface LineChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  yKey,
  title,
  color = '#3B82F6',
  height = 300,
}) => {
  // Simple SVG-based line chart implementation
  const maxValue = Math.max(...data.map(d => d[yKey]));
  const minValue = Math.min(...data.map(d => d[yKey]));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item[yKey] - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
      )}
      <div className="bg-white p-4 rounded-lg border">
        <svg width="100%" height={height} viewBox="0 0 100 100" className="overflow-visible">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Area under curve */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#gradient)"
          />
          
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((item[yKey] - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={color}
                className="hover:r-3 transition-all"
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          {data.map((item, index) => (
            <span key={index}>{item[xKey]}</span>
          ))}
        </div>
      </div>
    </div>
  );
};