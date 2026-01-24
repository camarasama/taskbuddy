// ============================================================================
// Report API Service - FIXED VERSION
// API calls for PDF report generation and management
// Author: Souleymane Camara - BIT1007326
// ============================================================================

import api from './api';

// ============================================================================
// PDF EXPORT FUNCTIONS - 7 REPORTS (FIXED)
// ============================================================================

/**
 * 1. Export Child Performance Report to PDF
 */
export const exportChildPerformancePDF = async (data) => {
  try {
    console.log('📤 Exporting Child Performance PDF:', data);
    
    const response = await api.post('/export/pdf/child-performance', {
      child_id: data.childId || data.child_id,
      family_id: data.familyId || data.family_id,
      date_preset: data.datePreset || data.date_preset,
      start_date: data.startDate || data.start_date || null,
      end_date: data.endDate || data.end_date || null,
      filename: data.filename || `child_performance_${Date.now()}.pdf`
    });
    
    console.log('✅ Export success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error exporting child performance PDF:', error.response?.data || error);
    throw error;
  }
};

/**
 * 2. Export Task Analytics Report to PDF
 */
export const exportTaskAnalyticsPDF = async (data) => {
  try {
    console.log('📤 Exporting Task Analytics PDF:', data);
    
    const requestBody = {
      family_id: data.familyId || data.family_id,
      filename: data.filename || `task_analytics_${Date.now()}.pdf`
    };

    // Only add date fields if they exist
    if (data.datePreset || data.date_preset) {
      requestBody.date_preset = data.datePreset || data.date_preset;
    }
    if (data.startDate || data.start_date) {
      requestBody.start_date = data.startDate || data.start_date;
    }
    if (data.endDate || data.end_date) {
      requestBody.end_date = data.endDate || data.end_date;
    }

    console.log('📦 Request body:', requestBody);
    
    const response = await api.post('/export/pdf/task-analytics', requestBody);
    
    console.log('✅ Export success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error exporting task analytics PDF:', error.response?.data || error);
    throw error;
  }
};

/**
 * 3. Export Family Summary Report to PDF
 */
export const exportFamilySummaryPDF = async (data) => {
  try {
    console.log('📤 Exporting Family Summary PDF:', data);
    
    const requestBody = {
      family_id: data.familyId || data.family_id,
      filename: data.filename || `family_summary_${Date.now()}.pdf`
    };

    if (data.datePreset || data.date_preset) {
      requestBody.date_preset = data.datePreset || data.date_preset;
    }
    if (data.startDate || data.start_date) {
      requestBody.start_date = data.startDate || data.start_date;
    }
    if (data.endDate || data.end_date) {
      requestBody.end_date = data.endDate || data.end_date;
    }

    console.log('📦 Request body:', requestBody);
    
    const response = await api.post('/export/pdf/family-summary', requestBody);
    
    console.log('✅ Export success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error exporting family summary PDF:', error.response?.data || error);
    throw error;
  }
};

/**
 * 4. Export Reward Analytics Report to PDF
 */
export const exportRewardAnalyticsPDF = async (data) => {
  try {
    console.log('📤 Exporting Reward Analytics PDF:', data);
    
    const requestBody = {
      family_id: data.familyId || data.family_id,
      filename: data.filename || `reward_analytics_${Date.now()}.pdf`
    };

    if (data.datePreset || data.date_preset) {
      requestBody.date_preset = data.datePreset || data.date_preset;
    }
    if (data.startDate || data.start_date) {
      requestBody.start_date = data.startDate || data.start_date;
    }
    if (data.endDate || data.end_date) {
      requestBody.end_date = data.endDate || data.end_date;
    }

    console.log('📦 Request body:', requestBody);
    
    const response = await api.post('/export/pdf/reward-analytics', requestBody);
    
    console.log('✅ Export success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error exporting reward analytics PDF:', error.response?.data || error);
    throw error;
  }
};

/**
 * 5. Export Parent Activity Report to PDF
 */
export const exportParentActivityPDF = async (data) => {
  try {
    console.log('📤 Exporting Parent Activity PDF:', data);
    
    const requestBody = {
      parent_id: data.parentId || data.parent_id,
      family_id: data.familyId || data.family_id,
      filename: data.filename || `parent_activity_${Date.now()}.pdf`
    };

    if (data.datePreset || data.date_preset) {
      requestBody.date_preset = data.datePreset || data.date_preset;
    }
    if (data.startDate || data.start_date) {
      requestBody.start_date = data.startDate || data.start_date;
    }
    if (data.endDate || data.end_date) {
      requestBody.end_date = data.endDate || data.end_date;
    }

    console.log('📦 Request body:', requestBody);
    
    const response = await api.post('/export/pdf/parent-activity', requestBody);
    
    console.log('✅ Export success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error exporting parent activity PDF:', error.response?.data || error);
    throw error;
  }
};

/**
 * 6. Export Points Distribution Report to PDF
 */
export const exportPointsDistributionPDF = async (data) => {
  try {
    console.log('📤 Exporting Points Distribution PDF:', data);
    
    const requestBody = {
      family_id: data.familyId || data.family_id,
      filename: data.filename || `points_distribution_${Date.now()}.pdf`
    };

    console.log('📦 Request body:', requestBody);
    
    const response = await api.post('/export/pdf/points-distribution', requestBody);
    
    console.log('✅ Export success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error exporting points distribution PDF:', error.response?.data || error);
    throw error;
  }
};

/**
 * 7. Export Children Comparison Report to PDF
 */
export const exportChildrenComparisonPDF = async (data) => {
  try {
    console.log('📤 Exporting Children Comparison PDF:', data);
    
    const requestBody = {
      family_id: data.familyId || data.family_id,
      filename: data.filename || `children_comparison_${Date.now()}.pdf`
    };

    if (data.datePreset || data.date_preset) {
      requestBody.date_preset = data.datePreset || data.date_preset;
    }
    if (data.startDate || data.start_date) {
      requestBody.start_date = data.startDate || data.start_date;
    }
    if (data.endDate || data.end_date) {
      requestBody.end_date = data.endDate || data.end_date;
    }

    console.log('📦 Request body:', requestBody);
    
    const response = await api.post('/export/pdf/children-comparison', requestBody);
    
    console.log('✅ Export success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error exporting children comparison PDF:', error.response?.data || error);
    throw error;
  }
};

// ============================================================================
// FILE MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Download exported PDF file
 */
export const downloadPDF = async (filename) => {
  try {
    console.log('📥 Downloading PDF:', filename);
    
    const response = await api.get(`/export/download/${filename}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Download complete');
    return { success: true, message: 'File downloaded successfully' };
  } catch (error) {
    console.error('❌ Error downloading PDF:', error);
    throw error;
  }
};

/**
 * List all exported files
 */
export const listExportedFiles = async () => {
  try {
    console.log('📋 Listing exported files...');
    const response = await api.get('/export/files');
    console.log('✅ Files retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error listing exported files:', error);
    throw error;
  }
};

/**
 * Delete exported file
 */
export const deleteExportedFile = async (filename) => {
  try {
    console.log('🗑️ Deleting file:', filename);
    const response = await api.delete(`/export/files/${filename}`);
    console.log('✅ File deleted');
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw error;
  }
};

/**
 * Clean up old files
 */
export const cleanupOldFiles = async () => {
  try {
    console.log('🧹 Cleaning up old files...');
    const response = await api.post('/export/cleanup');
    console.log('✅ Cleanup complete');
    return response.data;
  } catch (error) {
    console.error('❌ Error cleaning up files:', error);
    throw error;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get download URL for a file
 */
export const getDownloadURL = (filename) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseURL}/api/export/download/${filename}`;
};

/**
 * Generate filename with timestamp
 */
export const generateFilename = (reportType, extension = '.pdf') => {
  const timestamp = Date.now();
  return `${reportType}_${timestamp}${extension}`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get date preset label
 */
export const getDatePresetLabel = (preset) => {
  const labels = {
    today: 'Today',
    this_week: 'This Week',
    this_month: 'This Month',
    this_year: 'This Year',
    last_7_days: 'Last 7 Days',
    last_30_days: 'Last 30 Days',
    last_90_days: 'Last 90 Days',
    custom: 'Custom Range'
  };
  return labels[preset] || preset;
};

// Export all functions as default object
export default {
  exportChildPerformancePDF,
  exportTaskAnalyticsPDF,
  exportFamilySummaryPDF,
  exportRewardAnalyticsPDF,
  exportParentActivityPDF,
  exportPointsDistributionPDF,
  exportChildrenComparisonPDF,
  downloadPDF,
  listExportedFiles,
  deleteExportedFile,
  cleanupOldFiles,
  getDownloadURL,
  generateFilename,
  formatFileSize,
  getDatePresetLabel
};