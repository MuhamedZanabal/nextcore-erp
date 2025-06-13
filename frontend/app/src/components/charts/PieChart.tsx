import React from 'react';

interface PieChartProps {
  data: any[];
  labelKey: string;
  valueKey: string;
  title?: string;
  colors?: string[];
  size?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  labelKey,
  valueKey,
  title,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
  size = 200,
}) => {
  const total = data.reduce((sum, item) => sum + item[valueKey], 0);
  let currentAngle = 0;

  const slices = data.map((item, index) => {
    const percentage = (item[valueKey] / total) * 100;
    const angle = (item[valueKey] / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    const x1 = Math.cos((startAngle * Math.PI) / 180);
    const y1 = Math.sin((startAngle * Math.PI) / 180);
    const x2 = Math.cos((endAngle * Math.PI) / 180);
    const y2 = Math.sin((endAngle * Math.PI) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      'M', 0, 0,
      'L', x1, y1,
      'A', 1, 1, 0, largeArcFlag, 1, x2, y2,
      'Z'
    ].join(' ');

    return {
      ...item,
      pathData,
      color: colors[index % colors.length],
      percentage: percentage.toFixed(1),
    };
  });

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
      )}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <svg width={size} height={size} viewBox="-1 -1 2 2" className="transform -rotate-90">
            {slices.map((slice, index) => (
              <path
                key={index}
                d={slice.pathData}
                fill={slice.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </svg>
          
          <div className="ml-4 space-y-2">
            {slices.map((slice, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-sm text-gray-700">
                  {slice[labelKey]} ({slice.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};