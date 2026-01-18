import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import Button from './Button';
import Input from './Input';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

/**
 * Table Component
 * 
 * A feature-rich table with sorting, filtering, pagination, and more.
 * 
 * @component
 * @example
 * ```jsx
 * const columns = [
 *   { key: 'name', label: 'Name', sortable: true },
 *   { key: 'email', label: 'Email', sortable: true },
 *   { 
 *     key: 'actions', 
 *     label: 'Actions',
 *     render: (row) => <Button size="sm">Edit</Button>
 *   }
 * ];
 * 
 * <Table
 *   data={users}
 *   columns={columns}
 *   keyField="id"
 *   searchable
 *   exportable
 * />
 * ```
 */
const Table = ({
  data = [],
  columns = [],
  keyField = 'id',
  loading = false,
  searchable = false,
  searchFields = [],
  sortable = true,
  selectable = false,
  onSelect,
  pagination = true,
  pageSize = 10,
  exportable = false,
  emptyMessage = 'No data found',
  className = '',
  onRowClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery || !searchable) return data;

    const query = searchQuery.toLowerCase();
    const fieldsToSearch = searchFields.length > 0 ? searchFields : columns.map(col => col.key);

    return data.filter((row) =>
      fieldsToSearch.some((field) => {
        const value = row[field];
        return value && value.toString().toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, searchable, searchFields, columns]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return;

    const column = columns.find((col) => col.key === key);
    if (column && column.sortable === false) return;

    let direction = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else {
        // Reset sorting
        setSortConfig({ key: null, direction: null });
        return;
      }
    }
    setSortConfig({ key, direction });
  };

  // Handle row selection
  const handleSelectRow = (rowId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
    if (onSelect) {
      onSelect(Array.from(newSelected));
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      if (onSelect) onSelect([]);
    } else {
      const allIds = new Set(paginatedData.map((row) => row[keyField]));
      setSelectedRows(allIds);
      if (onSelect) onSelect(Array.from(allIds));
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = columns.map((col) => col.label).join(',');
    const rows = sortedData.map((row) =>
      columns
        .map((col) => {
          const value = row[col.key];
          // Escape commas and quotes
          const stringValue = value?.toString() || '';
          return `"${stringValue.replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-export-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      );
    }
    return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return <LoadingState type="table" rows={pageSize} />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Export Bar */}
      {(searchable || exportable) && (
        <div className="flex items-center justify-between gap-4">
          {searchable && (
            <div className="flex-1 max-w-sm">
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                icon={Search}
              />
            </div>
          )}
          {exportable && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={sortedData.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              {/* Selection checkbox */}
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      selectedRows.size === paginatedData.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </th>
              )}

              {/* Column headers */}
              {columns.map((column) => {
                const isSortable = sortable && column.sortable !== false;
                return (
                  <th
                    key={column.key}
                    className={`
                      px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                      ${isSortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
                      ${column.align === 'center' ? 'text-center' : ''}
                      ${column.align === 'right' ? 'text-right' : ''}
                    `}
                    onClick={() => isSortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {isSortable && renderSortIcon(column.key)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-8">
                  <EmptyState
                    title={emptyMessage}
                    description={searchQuery ? 'Try adjusting your search' : ''}
                    size="sm"
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const rowId = row[keyField];
                const isSelected = selectedRows.has(rowId);

                return (
                  <tr
                    key={rowId}
                    className={`
                      ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                      ${isSelected ? 'bg-primary-50' : ''}
                    `}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {/* Selection checkbox */}
                    {selectable && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRow(rowId);
                          }}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`
                          px-6 py-4 whitespace-nowrap text-sm text-gray-900
                          ${column.align === 'center' ? 'text-center' : ''}
                          ${column.align === 'right' ? 'text-right' : ''}
                        `}
                      >
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && sortedData.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            {sortedData.length} results
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`
                      px-3 py-1 text-sm rounded
                      ${
                        currentPage === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

Table.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      render: PropTypes.func,
    })
  ).isRequired,
  keyField: PropTypes.string,
  loading: PropTypes.bool,
  searchable: PropTypes.bool,
  searchFields: PropTypes.arrayOf(PropTypes.string),
  sortable: PropTypes.bool,
  selectable: PropTypes.bool,
  onSelect: PropTypes.func,
  pagination: PropTypes.bool,
  pageSize: PropTypes.number,
  exportable: PropTypes.bool,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  onRowClick: PropTypes.func,
};

export default Table;
