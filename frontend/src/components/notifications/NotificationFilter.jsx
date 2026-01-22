import { Filter, X } from 'lucide-react';

/**
 * NotificationFilter Component
 * Provides filtering options for notifications
 * 
 * @param {Object} props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Callback when filters change
 * @param {Function} props.onReset - Callback to reset filters
 */
export default function NotificationFilter({ 
  filters = {},
  onFilterChange,
  onReset 
}) {
  const handleTypeChange = (e) => {
    onFilterChange({ ...filters, type: e.target.value });
  };

  const handleStatusChange = (e) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const handleDateChange = (e) => {
    onFilterChange({ ...filters, dateRange: e.target.value });
  };

  const hasActiveFilters = () => {
    return filters.type !== 'all' || 
           filters.status !== 'all' || 
           filters.dateRange !== 'all';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        </div>

        {hasActiveFilters() && onReset && (
          <button
            onClick={onReset}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Type Filter */}
        <div>
          <label htmlFor="type-filter" className="block text-xs font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="type-filter"
            value={filters.type || 'all'}
            onChange={handleTypeChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="task">Tasks</option>
            <option value="reward">Rewards</option>
            <option value="family">Family</option>
            <option value="points">Points</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status || 'all'}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label htmlFor="date-filter" className="block text-xs font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            id="date-filter"
            value={filters.dateRange || 'all'}
            onChange={handleDateChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.type !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Type: {filters.type}
                <button
                  onClick={() => onFilterChange({ ...filters, type: 'all' })}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {filters.status}
                <button
                  onClick={() => onFilterChange({ ...filters, status: 'all' })}
                  className="ml-1 hover:text-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.dateRange !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Period: {filters.dateRange}
                <button
                  onClick={() => onFilterChange({ ...filters, dateRange: 'all' })}
                  className="ml-1 hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example Usage:
 * 
 * const [filters, setFilters] = useState({
 *   type: 'all',
 *   status: 'all',
 *   dateRange: 'all'
 * });
 * 
 * <NotificationFilter
 *   filters={filters}
 *   onFilterChange={setFilters}
 *   onReset={() => setFilters({ type: 'all', status: 'all', dateRange: 'all' })}
 * />
 */
