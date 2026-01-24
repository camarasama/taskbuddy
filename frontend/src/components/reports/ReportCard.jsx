// ============================================================================
// Report Card Component
// Displays individual report information with export functionality
// Author: Souleymane Camara - BIT1007326
// ============================================================================

import { useState } from 'react';
import { FileText, Download, Calendar, Loader2 } from 'lucide-react';

const ReportCard = ({ 
  report, 
  onExport, 
  datePreset, 
  startDate, 
  endDate 
}) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport(report, datePreset, startDate, endDate);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      {/* Icon and Title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${report.colorClass}`}>
            <report.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {report.title}
            </h3>
            <p className="text-sm text-gray-500">{report.category}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {report.description}
      </p>

      {/* Features */}
      <div className="space-y-2 mb-4">
        <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
          Includes:
        </p>
        <div className="flex flex-wrap gap-2">
          {report.features.map((feature, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Date Range Info */}
      {datePreset !== 'all_time' && (
        <div className="flex items-center text-xs text-gray-500 mb-4 bg-blue-50 px-3 py-2 rounded-md">
          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
          <span>
            {datePreset === 'custom' && startDate && endDate
              ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
              : datePreset.replace('_', ' ').toUpperCase()
            }
          </span>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {exporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Export to PDF
          </>
        )}
      </button>

      {/* File Info */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        <FileText className="w-3 h-3 inline mr-1" />
        PDF • Estimated size: {report.estimatedSize}
      </div>
    </div>
  );
};

export default ReportCard;
