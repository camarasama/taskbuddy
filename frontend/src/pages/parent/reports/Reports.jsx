// ============================================================================
// Reports Page
// Main page for PDF report generation and management
// Author: Souleymane Camara - BIT1007326
// ============================================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import reportApi from '../../../services/reportApi';
import ReportCard from '../../../components/reports/ReportCard';
import DateRangeSelector from '../../../components/reports/DateRangeSelector';
import ExportedFiles from '../../../components/reports/ExportedFiles';
import {
  FileText,
  TrendingUp,
  Users,
  Award,
  Activity,
  PieChart,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();
  const [datePreset, setDatePreset] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notification, setNotification] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get family_id from user
  const familyId = user?.family_id;

  // Report definitions
  const reports = [
    {
      id: 'child_performance',
      title: 'Child Performance Report',
      description: 'Detailed performance analysis for individual children including tasks completed, points earned, and achievement tracking.',
      icon: TrendingUp,
      colorClass: 'bg-blue-600',
      category: 'Individual',
      features: ['Task Completion', 'Points Earned', 'Achievements', 'Trends'],
      estimatedSize: '~250KB',
      requiresChild: true,
      exportFunction: reportApi.exportChildPerformancePDF
    },
    {
      id: 'task_analytics',
      title: 'Task Analytics Report',
      description: 'Comprehensive task management analysis including completion rates, overdue tasks, and category breakdown.',
      icon: CheckCircle,
      colorClass: 'bg-green-600',
      category: 'Tasks',
      features: ['Status Distribution', 'Categories', 'Overdue Tasks', 'Completion Rates'],
      estimatedSize: '~200KB',
      requiresChild: false,
      exportFunction: reportApi.exportTaskAnalyticsPDF
    },
    {
      id: 'family_summary',
      title: 'Family Summary Report',
      description: 'Complete family activity overview including all members, tasks, rewards, and engagement metrics.',
      icon: Users,
      colorClass: 'bg-purple-600',
      category: 'Family',
      features: ['Member Performance', 'Top Performers', 'Activity Feed', 'Engagement'],
      estimatedSize: '~280KB',
      requiresChild: false,
      exportFunction: reportApi.exportFamilySummaryPDF
    },
    {
      id: 'reward_analytics',
      title: 'Reward Analytics Report',
      description: 'Reward system analysis including redemption statistics, popular rewards, and points spending patterns.',
      icon: Award,
      colorClass: 'bg-yellow-600',
      category: 'Rewards',
      features: ['Redemptions', 'Popular Rewards', 'Points Spent', 'Trends'],
      estimatedSize: '~220KB',
      requiresChild: false,
      exportFunction: reportApi.exportRewardAnalyticsPDF
    },
    {
      id: 'parent_activity',
      title: 'Parent Activity Report',
      description: 'Parent management activity tracking including tasks created, reviews completed, and approval rates.',
      icon: Activity,
      colorClass: 'bg-indigo-600',
      category: 'Management',
      features: ['Tasks Created', 'Reviews Done', 'Approval Rate', 'Recent Actions'],
      estimatedSize: '~190KB',
      requiresChild: false,
      requiresParent: true,
      exportFunction: reportApi.exportParentActivityPDF
    },
    {
      id: 'points_distribution',
      title: 'Points Distribution Report',
      description: 'Points analysis across all family members showing earnings, spending, and balance distribution.',
      icon: PieChart,
      colorClass: 'bg-pink-600',
      category: 'Points',
      features: ['Balance by Child', 'Top Earners', 'Distribution', 'Breakdown'],
      estimatedSize: '~180KB',
      requiresChild: false,
      exportFunction: reportApi.exportPointsDistributionPDF
    },
    {
      id: 'children_comparison',
      title: 'Children Comparison Report',
      description: 'Side-by-side performance comparison of all children with rankings and detailed insights.',
      icon: BarChart3,
      colorClass: 'bg-teal-600',
      category: 'Comparison',
      features: ['Side-by-Side', 'Rankings', 'Progress Bars', 'Insights'],
      estimatedSize: '~240KB',
      requiresChild: false,
      exportFunction: reportApi.exportChildrenComparisonPDF
    }
  ];

  const categories = [
    { value: 'all', label: 'All Reports' },
    { value: 'Individual', label: 'Individual' },
    { value: 'Tasks', label: 'Tasks' },
    { value: 'Family', label: 'Family' },
    { value: 'Rewards', label: 'Rewards' },
    { value: 'Management', label: 'Management' },
    { value: 'Points', label: 'Points' },
    { value: 'Comparison', label: 'Comparison' }
  ];

  const filteredReports = selectedCategory === 'all'
    ? reports
    : reports.filter(r => r.category === selectedCategory);

  const handleExport = async (report, preset, start, end) => {
    try {
      setNotification({ type: 'info', message: `Generating ${report.title}...` });

      const exportData = {
        familyId,
        datePreset: preset,
        startDate: start,
        endDate: end,
        filename: reportApi.generateFilename(report.id)
      };

      // Add parent_id for parent activity report
      if (report.requiresParent) {
        exportData.parentId = user?.user_id;
      }

      // For child-specific reports, need to select child
      if (report.requiresChild) {
        // TODO: Implement child selector
        setNotification({
          type: 'error',
          message: 'Please select a child for this report'
        });
        return;
      }

      const response = await report.exportFunction(exportData);

      if (response.success) {
        setNotification({
          type: 'success',
          message: `${report.title} generated successfully! Check "Exported Files" section below.`
        });

        // Trigger file list refresh
        window.dispatchEvent(new Event('refreshExportedFiles'));
      } else {
        throw new Error(response.message || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to generate report. Please try again.'
      });
    }
  };

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Generate and export PDF reports for your family's activity
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`rounded-lg p-4 flex items-start ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : notification.type === 'error'
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          ) : notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          ) : (
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                notification.type === 'success'
                  ? 'text-green-800'
                  : notification.type === 'error'
                  ? 'text-red-800'
                  : 'text-blue-800'
              }`}
            >
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="ml-3 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Date Range Selector */}
      <DateRangeSelector
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Available Reports ({filteredReports.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onExport={handleExport}
              datePreset={datePreset}
              startDate={startDate}
              endDate={endDate}
            />
          ))}
        </div>
      </div>

      {/* Exported Files Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Downloaded Reports
        </h2>
        <ExportedFiles />
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">📊 About Reports</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Reports are generated as professional PDF documents</li>
          <li>• Select a date range before exporting for time-specific data</li>
          <li>• Exported files are stored for 24 hours then automatically deleted</li>
          <li>• Download important reports to save them permanently</li>
          <li>• All reports include charts, tables, and detailed analysis</li>
        </ul>
      </div>
    </div>
  );
};

export default Reports;
