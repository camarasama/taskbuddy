import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatCard Component
 * Displays a statistic card with icon, value, label, and optional trend
 * 
 * @param {Object} props
 * @param {React.Component} props.icon - Icon component from lucide-react
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.subtitle - Optional subtitle
 * @param {string} props.color - Tailwind color class (e.g., 'text-blue-600')
 * @param {string} props.bgColor - Background color class (e.g., 'bg-blue-100')
 * @param {Object} props.trend - Trend data {value: number, direction: 'up'|'down'|'neutral'}
 * @param {string} props.link - Optional link URL
 */
export default function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color = 'text-blue-600',
  bgColor = 'bg-blue-50',
  trend,
  link 
}) {
  const content = (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline mt-2">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {trend && (
              <div className="ml-3 flex items-center">
                {trend.direction === 'up' && (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                )}
                {trend.direction === 'down' && (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                {trend.direction === 'neutral' && (
                  <Minus className="w-4 h-4 text-gray-400 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  trend.direction === 'up' ? 'text-green-600' :
                  trend.direction === 'down' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${bgColor} p-3 rounded-full`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * Example Usage:
 * 
 * <StatCard
 *   icon={Users}
 *   title="Total Users"
 *   value="1,234"
 *   subtitle="Active this month"
 *   color="text-blue-600"
 *   bgColor="bg-blue-50"
 *   trend={{ value: 12, direction: 'up' }}
 *   link="/admin/users"
 * />
 */
