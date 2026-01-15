import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRevenueDashboard, useMRR, useRevenueByCategory, useRevenueByClient, useRevenueVsExpenses, useReceivables } from '../hooks/useRevenue';
import MRRARRCards from '../components/revenue/MRRARRCards';
import RevenueByCategory from '../components/revenue/RevenueByCategory';
import RevenueByClient from '../components/revenue/RevenueByClient';
import RevenueVsExpenses from '../components/revenue/RevenueVsExpenses';
import ReceivablesTable from '../components/revenue/ReceivablesTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format, subDays } from 'date-fns';

export default function RevenueAnalytics() {
  const { logout } = useAuth();
  const [period, setPeriod] = useState('30d');

  // Calculate dates for period
  const endDate = new Date();
  const startDate = new Date();
  if (period === '30d') startDate.setDate(startDate.getDate() - 30);
  if (period === '90d') startDate.setDate(startDate.getDate() - 90);
  if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);

  const dateFrom = format(startDate, 'yyyy-MM-dd');
  const dateTo = format(endDate, 'yyyy-MM-dd');

  const { data: dashboard, isLoading: dashboardLoading } = useRevenueDashboard(period);
  const { data: mrrData } = useMRR();
  const { data: categoryData, isLoading: categoryLoading } = useRevenueByCategory(dateFrom, dateTo);
  const { data: clientData, isLoading: clientLoading } = useRevenueByClient(dateFrom, dateTo);
  const { data: plData, isLoading: plLoading } = useRevenueVsExpenses(period);
  const { data: receivablesData, isLoading: receivablesLoading } = useReceivables();

  const isLoading = dashboardLoading;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-xl font-bold text-primary-600">
                AIGA LLC Finance
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/revenue"
                className="text-primary-600 hover:text-primary-700 font-medium border-b-2 border-primary-600 py-5"
              >
                Revenue Analytics
              </Link>
            </div>
            <div className="flex items-center">
              <button onClick={logout} className="btn btn-secondary text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive financial insights and performance metrics
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {['30d', '90d', '1y'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p === '30d' ? 'Last 30 Days' : p === '90d' ? 'Last 90 Days' : 'Last Year'}
              </button>
            ))}
          </div>
        </div>

        {/* MRR/ARR Cards */}
        <div className="mb-8">
          <MRRARRCards
            mrrData={mrrData}
            isLoading={false}
          />
        </div>

        {/* Top Row - Category and Client */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          <RevenueByCategory
            data={categoryData?.breakdown || []}
            isLoading={categoryLoading}
          />
          <RevenueByClient
            data={clientData?.breakdown || []}
            isLoading={clientLoading}
          />
        </div>

        {/* P&L Report */}
        <div className="mb-8">
          <RevenueVsExpenses
            data={plData || []}
            isLoading={plLoading}
          />
        </div>

        {/* Outstanding Receivables */}
        <div>
          <ReceivablesTable
            data={receivablesData?.aging || []}
            isLoading={receivablesLoading}
          />
        </div>
      </div>
    </div>
  );
}
