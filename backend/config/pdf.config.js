// ============================================================================
// PDF Configuration
// Settings for PDF report generation
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const path = require('path');

module.exports = {
  // Export directory (relative to backend root)
  exportDir: path.join(__dirname, '../exports'),
  
  // Temporary directory for intermediate files
  tempDir: path.join(__dirname, '../temp'),
  
  // Maximum file age before cleanup (24 hours in milliseconds)
  maxFileAge: 24 * 60 * 60 * 1000,
  
  // Maximum export file size (10MB in bytes)
  maxFileSize: 10 * 1024 * 1024,
  
  // PDF Document Settings
  document: {
    // Page size (A4, Letter, Legal, etc.)
    size: 'A4',
    
    // Page margins (in points, 72 points = 1 inch)
    margins: {
      top: 60,
      bottom: 60,
      left: 50,
      right: 50
    },
    
    // Auto-add page numbers
    autoPageNumbers: true,
    
    // Buffer pages for footer generation
    bufferPages: true
  },
  
  // Font Settings
  fonts: {
    // Default font family
    default: 'Helvetica',
    
    // Bold font
    bold: 'Helvetica-Bold',
    
    // Italic font
    italic: 'Helvetica-Oblique',
    
    // Bold italic font
    boldItalic: 'Helvetica-BoldOblique',
    
    // Default font size
    defaultSize: 11,
    
    // Header font size
    headerSize: 24,
    
    // Section heading size
    headingSize: 16,
    
    // Small text size
    smallSize: 9
  },
  
  // Color Scheme
  colors: {
    // Primary brand color
    primary: '#4F46E5',
    
    // Secondary color
    secondary: '#10B981',
    
    // Success color
    success: '#10B981',
    
    // Warning color
    warning: '#F59E0B',
    
    // Danger/Error color
    danger: '#EF4444',
    
    // Info color
    info: '#3B82F6',
    
    // Dark text
    dark: '#1F2937',
    
    // Medium text
    medium: '#6B7280',
    
    // Light background
    light: '#F3F4F6',
    
    // White
    white: '#FFFFFF'
  },
  
  // Branding
  branding: {
    // Application name
    appName: 'TaskBuddy',
    
    // Tagline
    tagline: 'Family Task Management System',
    
    // Show branding on every page
    showOnEveryPage: true,
    
    // Logo path (if you have one)
    logoPath: null
  },
  
  // Chart Settings
  charts: {
    // Default chart width
    width: 400,
    
    // Default chart height
    height: 200,
    
    // Bar chart settings
    barChart: {
      barWidth: 40,
      spacing: 10,
      showValues: true,
      showLabels: true
    },
    
    // Progress bar settings
    progressBar: {
      width: 300,
      height: 20,
      showPercentage: true
    }
  },
  
  // Table Settings
  tables: {
    // Row height
    rowHeight: 30,
    
    // Header background color
    headerBgColor: '#4F46E5',
    
    // Header text color
    headerTextColor: '#FFFFFF',
    
    // Alternate row colors
    alternateRows: true,
    
    // Even row color
    evenRowColor: '#FFFFFF',
    
    // Odd row color
    oddRowColor: '#F3F4F6',
    
    // Border color
    borderColor: '#E5E7EB'
  },
  
  // File Naming
  fileNaming: {
    // Include timestamp in filename
    includeTimestamp: true,
    
    // Timestamp format
    timestampFormat: 'unix', // 'unix' or 'iso'
    
    // Prefix for exported files
    prefix: '',
    
    // File extension
    extension: '.pdf'
  },
  
  // Performance Settings
  performance: {
    // Compress PDF output
    compress: true,
    
    // Use streams for large files
    useStreams: true,
    
    // Maximum concurrent PDF generations
    maxConcurrent: 5
  },
  
  // Cleanup Settings
  cleanup: {
    // Enable automatic cleanup
    enabled: true,
    
    // Cleanup schedule (cron format - daily at 3 AM)
    schedule: '0 3 * * *',
    
    // File age threshold for cleanup (hours)
    ageThresholdHours: 24,
    
    // Keep minimum number of recent files
    keepRecentFiles: 10
  },
  
  // Report-Specific Settings
  reports: {
    // Child Performance Report
    childPerformance: {
      includeCharts: true,
      includeAchievements: true,
      maxAchievements: 5
    },
    
    // Task Analytics Report
    taskAnalytics: {
      includeCharts: true,
      includeOverdueTasks: true,
      maxOverdueTasks: 10
    },
    
    // Family Summary Report
    familySummary: {
      includeTopPerformers: true,
      topPerformersCount: 3,
      includeRecentActivity: true,
      maxRecentActivities: 10
    },
    
    // Reward Analytics Report
    rewardAnalytics: {
      includePopularRewards: true,
      topRewardsCount: 5,
      includeTrends: true
    },
    
    // Parent Activity Report
    parentActivity: {
      includeRecentActions: true,
      maxRecentActions: 10,
      includeCategoryBreakdown: true
    },
    
    // Points Distribution Report
    pointsDistribution: {
      includeTopEarners: true,
      topEarnersCount: 3,
      includeDetailedBreakdown: true
    },
    
    // Children Comparison Report
    childrenComparison: {
      includeProgressBars: true,
      includeCharts: true,
      includeInsights: true
    }
  },
  
  // Error Handling
  errors: {
    // Retry failed PDF generation
    retryOnFailure: true,
    
    // Number of retry attempts
    maxRetries: 3,
    
    // Retry delay in milliseconds
    retryDelay: 1000
  },
  
  // Development Settings
  development: {
    // Enable debug logging
    debug: process.env.NODE_ENV === 'development',
    
    // Save intermediate files for debugging
    saveIntermediateFiles: false,
    
    // Log PDF generation time
    logGenerationTime: true
  }
};
