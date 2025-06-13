import React from 'react';
import { LineChart, BarChart, PieChart } from '../../components/charts';

const SalesDashboard: React.FC = () => {
  // Mock data for charts
  const salesData = [
    { month: 'Jan', revenue: 45000, orders: 120 },
    { month: 'Feb', revenue: 52000, orders: 135 },
    { month: 'Mar', revenue: 48000, orders: 128 },
    { month: 'Apr', revenue: 61000, orders: 156 },
    { month: 'May', revenue: 55000, orders: 142 },
    { month: 'Jun', revenue: 67000, orders: 178 },
  ];

  const productPerformanceData = [
    { product: 'Product A', sales: 25000 },
    { product: 'Product B', sales: 18000 },
    { product: 'Product C', sales: 15000 },
    { product: 'Product D', sales: 12000 },
    { product: 'Product E', sales: 8000 },
  ];

  const orderStatusData = [
    { status: 'Completed', count: 156 },
    { status: 'Processing', count: 45 },
    { status: 'Pending', count: 23 },
    { status: 'Cancelled', count: 8 },
  ];

  const kpis = [
    {
      title: 'Total Revenue',
      value: '$328,000',
      change: '+15%',
      changeType: 'positive' as const,
      icon: '💰',
    },
    {
      title: 'Orders',
      value: '859',
      change: '+12%',
      changeType: 'positive' as const,
      icon: '📦',
    },
    {
      title: 'Avg Order Value',
      value: '$382',
      change: '+3%',
      changeType: 'positive' as const,
      icon: '💳',
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '-0.5%',
      changeType: 'negative' as const,
      icon: '📈',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            New Order
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className={`text-sm ${
                  kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change} from last month
                </p>
              </div>
              <div className="text-3xl">{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <LineChart
            data={salesData}
            xKey="month"
            yKey="revenue"
            title="Revenue Trend"
            color="#10B981"
          />
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <PieChart
            data={orderStatusData}
            labelKey="status"
            valueKey="count"
            title="Order Status Distribution"
          />
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm lg:col-span-2">
          <BarChart
            data={productPerformanceData}
            xKey="product"
            yKey="sales"
            title="Top Products by Sales"
            color="#3B82F6"
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { id: 'ORD-001', customer: 'Acme Corp', amount: '$1,250', status: 'Completed', date: '2023-06-15' },
                { id: 'ORD-002', customer: 'Tech Solutions', amount: '$890', status: 'Processing', date: '2023-06-14' },
                { id: 'ORD-003', customer: 'Global Industries', amount: '$2,100', status: 'Pending', date: '2023-06-14' },
                { id: 'ORD-004', customer: 'StartupXYZ', amount: '$450', status: 'Completed', date: '2023-06-13' },
                { id: 'ORD-005', customer: 'Enterprise Ltd', amount: '$3,200', status: 'Processing', date: '2023-06-13' },
              ].map((order, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;