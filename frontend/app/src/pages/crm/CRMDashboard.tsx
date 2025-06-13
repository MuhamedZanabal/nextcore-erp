import React from 'react';
import { LineChart, BarChart, PieChart } from '../../components/charts';

const CRMDashboard: React.FC = () => {
  // Mock data for charts
  const salesData = [
    { month: 'Jan', sales: 12000 },
    { month: 'Feb', sales: 15000 },
    { month: 'Mar', sales: 18000 },
    { month: 'Apr', sales: 22000 },
    { month: 'May', sales: 25000 },
    { month: 'Jun', sales: 28000 },
  ];

  const leadSourceData = [
    { source: 'Website', count: 45 },
    { source: 'Referral', count: 32 },
    { source: 'Social Media', count: 28 },
    { source: 'Email Campaign', count: 15 },
  ];

  const opportunityStageData = [
    { stage: 'Qualification', value: 150000 },
    { stage: 'Proposal', value: 120000 },
    { stage: 'Negotiation', value: 80000 },
    { stage: 'Closed Won', value: 200000 },
  ];

  const kpis = [
    {
      title: 'Total Contacts',
      value: '1,234',
      change: '+12%',
      changeType: 'positive' as const,
      icon: '👥',
    },
    {
      title: 'Active Leads',
      value: '456',
      change: '+8%',
      changeType: 'positive' as const,
      icon: '🎯',
    },
    {
      title: 'Opportunities',
      value: '89',
      change: '-3%',
      changeType: 'negative' as const,
      icon: '💼',
    },
    {
      title: 'Conversion Rate',
      value: '24%',
      change: '+5%',
      changeType: 'positive' as const,
      icon: '📈',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Filter
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
            yKey="sales"
            title="Sales Trend"
            color="#3B82F6"
          />
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <PieChart
            data={leadSourceData}
            labelKey="source"
            valueKey="count"
            title="Lead Sources"
          />
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm lg:col-span-2">
          <BarChart
            data={opportunityStageData}
            xKey="stage"
            yKey="value"
            title="Opportunity Pipeline by Stage"
            color="#10B981"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                type: 'contact',
                message: 'New contact added: John Smith from Acme Corp',
                time: '2 hours ago',
                icon: '👤',
              },
              {
                type: 'opportunity',
                message: 'Opportunity "Enterprise Deal" moved to Proposal stage',
                time: '4 hours ago',
                icon: '💼',
              },
              {
                type: 'lead',
                message: 'Lead "Website Inquiry" converted to opportunity',
                time: '6 hours ago',
                icon: '🎯',
              },
              {
                type: 'campaign',
                message: 'Email campaign "Q2 Newsletter" sent to 1,200 contacts',
                time: '1 day ago',
                icon: '📧',
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMDashboard;