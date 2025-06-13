import React from 'react';

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKey,
  title,
  color = '#10B981',
  height = 300,
}) => {
  const maxValue = Math.max(...data.map(d => d[yKey]));

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
      )}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-end justify-between h-64 space-x-2">
          {data.map((item, index) => {
            const barHeight = (item[yKey] / maxValue) * 100;
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="text-xs text-gray-600 mb-1">
                  {item[yKey]}
                </div>
                <div
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: color,
                    minHeight: '4px',
                  }}
                />
                <div className="text-xs text-gray-600 mt-2 text-center">
                  {item[xKey]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};