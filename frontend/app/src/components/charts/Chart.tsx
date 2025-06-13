import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface ChartData {
  [key: string]: any;
}

export interface ChartProps {
  type: 'line' | 'area' | 'bar' | 'pie';
  data: ChartData[];
  xKey?: string;
  yKey?: string;
  title?: string;
  height?: number;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
}

const DEFAULT_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00ff00',
  '#ff00ff',
  '#00ffff',
  '#ff0000',
];

export function Chart({
  type,
  data,
  xKey = 'name',
  yKey = 'value',
  title,
  height = 300,
  colors = DEFAULT_COLORS,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
}: ChartProps) {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0] }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={yKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.6}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Bar dataKey={yKey} fill={colors[0]} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

// Specialized chart components
export function SalesChart({ data, title }: { data: ChartData[]; title?: string }) {
  return (
    <Chart
      type="area"
      data={data}
      xKey="month"
      yKey="sales"
      title={title || "Sales Trend"}
      colors={['#10b981']}
    />
  );
}

export function PipelineChart({ data, title }: { data: ChartData[]; title?: string }) {
  return (
    <Chart
      type="bar"
      data={data}
      xKey="stage"
      yKey="count"
      title={title || "Sales Pipeline"}
      colors={['#3b82f6']}
    />
  );
}

export function RevenueChart({ data, title }: { data: ChartData[]; title?: string }) {
  return (
    <Chart
      type="line"
      data={data}
      xKey="date"
      yKey="revenue"
      title={title || "Revenue Trend"}
      colors={['#8b5cf6']}
    />
  );
}

export function LeadSourceChart({ data, title }: { data: ChartData[]; title?: string }) {
  return (
    <Chart
      type="pie"
      data={data}
      yKey="count"
      title={title || "Lead Sources"}
      height={250}
    />
  );
}