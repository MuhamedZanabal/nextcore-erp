import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { SalesChart, PipelineChart, RevenueChart, LeadSourceChart } from '../../components/charts';
import { TrendingUp, Users, DollarSign, ShoppingCart, Target, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  // Mock data for charts
  const salesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 4500 },
    { month: 'May', sales: 6000 },
    { month: 'Jun', sales: 5500 },
  ];

  const pipelineData = [
    { stage: 'Prospecting', count: 25 },
    { stage: 'Qualification', count: 18 },
    { stage: 'Proposal', count: 12 },
    { stage: 'Negotiation', count: 8 },
    { stage: 'Closed Won', count: 15 },
  ];

  const revenueData = [
    { date: '2023-01', revenue: 45000 },
    { date: '2023-02', revenue: 52000 },
    { date: '2023-03', revenue: 48000 },
    { date: '2023-04', revenue: 61000 },
    { date: '2023-05', revenue: 55000 },
    { date: '2023-06', revenue: 67000 },
  ];

  const leadSourceData = [
    { name: 'Website', count: 45 },
    { name: 'Referral', count: 32 },
    { name: 'Social Media', count: 28 },
    { name: 'Email Campaign', count: 22 },
    { name: 'Cold Calling', count: 15 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName} {user?.lastName}. Here's an overview of your business.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$328,000</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Opportunities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12 since last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Monthly revenue performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
            <CardDescription>
              Opportunities by stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineChart data={pipelineData} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>
              Monthly sales volume trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>
              Distribution of lead acquisition channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeadSourceChart data={leadSourceData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates from your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-4"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  New contact added
                </p>
                <p className="text-sm text-muted-foreground">
                  John Doe from Acme Corp - added by Sarah Johnson
                </p>
              </div>
              <div className="text-sm text-muted-foreground">2m ago</div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Opportunity updated
                </p>
                <p className="text-sm text-muted-foreground">
                  $50,000 deal moved to proposal stage - by Mike Chen
                </p>
              </div>
              <div className="text-sm text-muted-foreground">5m ago</div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-4"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Invoice sent
                </p>
                <p className="text-sm text-muted-foreground">
                  INV-2023-001 ($12,500) sent to TechCorp Ltd
                </p>
              </div>
              <div className="text-sm text-muted-foreground">10m ago</div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-4"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Lead converted
                </p>
                <p className="text-sm text-muted-foreground">
                  Lead from website form converted to opportunity
                </p>
              </div>
              <div className="text-sm text-muted-foreground">15m ago</div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-4"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Payment received
                </p>
                <p className="text-sm text-muted-foreground">
                  $8,750 payment received for INV-2023-045
                </p>
              </div>
              <div className="text-sm text-muted-foreground">22m ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}