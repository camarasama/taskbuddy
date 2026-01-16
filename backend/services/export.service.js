// ============================================================================
// Export Service
// Export reports to CSV and PDF formats
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const fs = require('fs').promises;
const path = require('path');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

class ExportService {
  
  constructor() {
    this.exportDir = path.join(__dirname, '../exports');
    this._ensureExportDirectory();
  }
  
  // ==========================================================================
  // CSV EXPORT METHODS
  // ==========================================================================
  
  /**
   * Export child performance report to CSV
   * @param {Object} reportData - Report data to export
   * @param {String} filename - Output filename
   * @returns {String} - File path
   */
  async exportChildPerformanceToCSV(reportData, filename = 'child_performance.csv') {
    try {
      const { child, recent_activity, monthly_trends } = reportData;
      
      // Prepare data for CSV
      const csvData = [
        // Summary section
        { section: 'Summary', field: 'Child Name', value: child.full_name },
        { section: 'Summary', field: 'Total Tasks', value: child.total_tasks_assigned },
        { section: 'Summary', field: 'Completed Tasks', value: child.tasks_completed },
        { section: 'Summary', field: 'Completion Rate', value: `${child.completion_rate}%` },
        { section: 'Summary', field: 'Total Points Earned', value: child.total_points_earned },
        { section: 'Summary', field: 'Current Points', value: child.current_points },
        { section: '', field: '', value: '' }, // Empty row
        
        // Recent activity section
        { section: 'Recent Activity', field: 'Task Title', value: 'Category', extra: 'Status' },
        ...recent_activity.map(activity => ({
          section: 'Recent Activity',
          field: activity.title,
          value: activity.category || 'N/A',
          extra: activity.status
        })),
        { section: '', field: '', value: '' }, // Empty row
        
        // Monthly trends section
        { section: 'Monthly Trends', field: 'Month', value: 'Tasks Assigned', extra: 'Completed', extra2: 'Points' },
        ...monthly_trends.map(trend => ({
          section: 'Monthly Trends',
          field: trend.month,
          value: trend.tasks_assigned,
          extra: trend.tasks_completed,
          extra2: trend.points_earned
        }))
      ];
      
      const csv = this._convertToCSV(csvData);
      const filePath = await this._saveFile(filename, csv);
      
      return {
        success: true,
        file_path: filePath,
        filename: filename,
        format: 'CSV'
      };
      
    } catch (error) {
      console.error('Error exporting child performance to CSV:', error);
      throw error;
    }
  }
  
  /**
   * Export task analytics report to CSV
   * @param {Object} reportData - Report data to export
   * @param {String} filename - Output filename
   * @returns {String} - File path
   */
  async exportTaskAnalyticsToCSV(reportData, filename = 'task_analytics.csv') {
    try {
      const { overview, category_breakdown, top_tasks, status_distribution } = reportData;
      
      const csvData = [
        // Overview section
        { section: 'Overview', field: 'Total Tasks Created', value: overview.total_tasks_created },
        { section: 'Overview', field: 'Total Assignments', value: overview.total_assignments },
        { section: 'Overview', field: 'Completed Assignments', value: overview.completed_assignments },
        { section: 'Overview', field: 'Completion Rate', value: `${overview.overall_completion_rate}%` },
        { section: 'Overview', field: 'Total Points Awarded', value: overview.total_points_awarded },
        { section: '', field: '', value: '' },
        
        // Category breakdown
        { section: 'Category Breakdown', field: 'Category', value: 'Total Tasks', extra: 'Completion Rate' },
        ...category_breakdown.map(cat => ({
          section: 'Category Breakdown',
          field: cat.category,
          value: cat.total_tasks,
          extra: `${cat.completion_rate}%`
        })),
        { section: '', field: '', value: '' },
        
        // Top tasks
        { section: 'Top Tasks', field: 'Task Title', value: 'Times Assigned', extra: 'Times Completed' },
        ...top_tasks.map(task => ({
          section: 'Top Tasks',
          field: task.title,
          value: task.times_assigned,
          extra: task.times_completed
        })),
        { section: '', field: '', value: '' },
        
        // Status distribution
        { section: 'Status Distribution', field: 'Status', value: 'Count' },
        ...status_distribution.map(status => ({
          section: 'Status Distribution',
          field: status.status,
          value: status.count
        }))
      ];
      
      const csv = this._convertToCSV(csvData);
      const filePath = await this._saveFile(filename, csv);
      
      return {
        success: true,
        file_path: filePath,
        filename: filename,
        format: 'CSV'
      };
      
    } catch (error) {
      console.error('Error exporting task analytics to CSV:', error);
      throw error;
    }
  }
  
  /**
   * Export reward analytics report to CSV
   * @param {Object} reportData - Report data to export
   * @param {String} filename - Output filename
   * @returns {String} - File path
   */
  async exportRewardAnalyticsToCSV(reportData, filename = 'reward_analytics.csv') {
    try {
      const { overview, popular_rewards, child_stats } = reportData;
      
      const csvData = [
        // Overview
        { section: 'Overview', field: 'Total Rewards', value: overview.total_rewards_available },
        { section: 'Overview', field: 'Redemption Requests', value: overview.total_redemption_requests },
        { section: 'Overview', field: 'Approved Redemptions', value: overview.approved_redemptions },
        { section: 'Overview', field: 'Approval Rate', value: `${overview.approval_rate}%` },
        { section: 'Overview', field: 'Total Points Spent', value: overview.total_points_spent },
        { section: '', field: '', value: '' },
        
        // Popular rewards
        { section: 'Popular Rewards', field: 'Reward Name', value: 'Points Required', extra: 'Redemptions' },
        ...popular_rewards.map(reward => ({
          section: 'Popular Rewards',
          field: reward.reward_name,
          value: reward.points_required,
          extra: reward.redemption_requests
        })),
        { section: '', field: '', value: '' },
        
        // Child stats
        { section: 'Child Statistics', field: 'Child Name', value: 'Redemption Requests', extra: 'Points Spent' },
        ...child_stats.map(child => ({
          section: 'Child Statistics',
          field: child.full_name,
          value: child.redemption_requests,
          extra: child.total_points_spent
        }))
      ];
      
      const csv = this._convertToCSV(csvData);
      const filePath = await this._saveFile(filename, csv);
      
      return {
        success: true,
        file_path: filePath,
        filename: filename,
        format: 'CSV'
      };
      
    } catch (error) {
      console.error('Error exporting reward analytics to CSV:', error);
      throw error;
    }
  }
  
  /**
   * Export family summary report to CSV
   * @param {Object} reportData - Report data to export
   * @param {String} filename - Output filename
   * @returns {String} - File path
   */
  async exportFamilySummaryToCSV(reportData, filename = 'family_summary.csv') {
    try {
      const { family_info, activity_stats, top_children } = reportData;
      
      const csvData = [
        // Family info
        { section: 'Family Information', field: 'Family Name', value: family_info.family_name },
        { section: 'Family Information', field: 'Family Code', value: family_info.family_code },
        { section: 'Family Information', field: 'Total Members', value: family_info.total_members },
        { section: 'Family Information', field: 'Total Family Points', value: family_info.total_family_points },
        { section: '', field: '', value: '' },
        
        // Activity stats
        { section: 'Activity Statistics', field: 'Tasks Created', value: activity_stats.total_tasks_created },
        { section: 'Activity Statistics', field: 'Total Assignments', value: activity_stats.total_assignments },
        { section: 'Activity Statistics', field: 'Completed Tasks', value: activity_stats.completed_tasks },
        { section: 'Activity Statistics', field: 'Total Points Earned', value: activity_stats.total_points_earned },
        { section: 'Activity Statistics', field: 'Total Points Spent', value: activity_stats.total_points_spent },
        { section: '', field: '', value: '' },
        
        // Top children
        { section: 'Top Performers', field: 'Child Name', value: 'Tasks Completed', extra: 'Completion Rate' },
        ...top_children.map(child => ({
          section: 'Top Performers',
          field: child.full_name,
          value: child.tasks_completed,
          extra: `${child.completion_rate}%`
        }))
      ];
      
      const csv = this._convertToCSV(csvData);
      const filePath = await this._saveFile(filename, csv);
      
      return {
        success: true,
        file_path: filePath,
        filename: filename,
        format: 'CSV'
      };
      
    } catch (error) {
      console.error('Error exporting family summary to CSV:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // PDF EXPORT METHODS
  // ==========================================================================
  
  /**
   * Export child performance report to PDF
   * @param {Object} reportData - Report data to export
   * @param {String} filename - Output filename
   * @returns {String} - File path
   */
  async exportChildPerformanceToPDF(reportData, filename = 'child_performance.pdf') {
    try {
      const { child, recent_activity, monthly_trends, report_period } = reportData;
      
      const doc = new PDFDocument({ margin: 50 });
      const filePath = path.join(this.exportDir, filename);
      const stream = require('fs').createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Header
      this._addPDFHeader(doc, 'Child Performance Report');
      
      // Report period
      doc
        .fontSize(10)
        .text(`Report Period: ${report_period.start_date} to ${report_period.end_date}`, { align: 'right' })
        .moveDown();
      
      // Child info section
      this._addPDFSection(doc, 'Child Information');
      doc
        .fontSize(12)
        .text(`Name: ${child.full_name}`)
        .text(`Current Points: ${child.current_points}`)
        .moveDown();
      
      // Performance summary
      this._addPDFSection(doc, 'Performance Summary');
      doc
        .fontSize(11)
        .text(`Total Tasks Assigned: ${child.total_tasks_assigned}`)
        .text(`Tasks Completed: ${child.tasks_completed}`)
        .text(`Tasks Pending: ${child.tasks_pending}`)
        .text(`Tasks Rejected: ${child.tasks_rejected}`)
        .text(`Completion Rate: ${child.completion_rate}%`)
        .text(`Total Points Earned: ${child.total_points_earned}`)
        .text(`Average Points per Task: ${child.avg_points_per_task}`)
        .moveDown();
      
      // Recent activity
      if (recent_activity && recent_activity.length > 0) {
        this._addPDFSection(doc, 'Recent Activity');
        
        // Table header
        const tableTop = doc.y;
        doc
          .fontSize(10)
          .text('Task', 50, tableTop, { width: 200 })
          .text('Category', 260, tableTop, { width: 100 })
          .text('Status', 370, tableTop, { width: 100 })
          .text('Points', 480, tableTop, { width: 80 });
        
        doc.moveTo(50, doc.y + 5).lineTo(560, doc.y + 5).stroke();
        
        // Table rows
        recent_activity.slice(0, 10).forEach((activity, index) => {
          const y = tableTop + 25 + (index * 20);
          doc
            .fontSize(9)
            .text(activity.title.substring(0, 30), 50, y, { width: 200 })
            .text(activity.category || 'N/A', 260, y, { width: 100 })
            .text(activity.status, 370, y, { width: 100 })
            .text(activity.points_reward || '-', 480, y, { width: 80 });
        });
        
        doc.moveDown(12);
      }
      
      // Monthly trends
      if (monthly_trends && monthly_trends.length > 0) {
        this._addPDFSection(doc, 'Monthly Trends');
        
        monthly_trends.forEach(trend => {
          doc
            .fontSize(10)
            .text(`${trend.month}: ${trend.tasks_completed} tasks completed, ${trend.points_earned} points earned`);
        });
      }
      
      // Footer
      this._addPDFFooter(doc);
      
      doc.end();
      
      // Wait for file to be written
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
      
      return {
        success: true,
        file_path: filePath,
        filename: filename,
        format: 'PDF'
      };
      
    } catch (error) {
      console.error('Error exporting child performance to PDF:', error);
      throw error;
    }
  }
  
  /**
   * Export task analytics report to PDF
   * @param {Object} reportData - Report data to export
   * @param {String} filename - Output filename
   * @returns {String} - File path
   */
  async exportTaskAnalyticsToPDF(reportData, filename = 'task_analytics.pdf') {
    try {
      const { overview, category_breakdown, top_tasks, report_period } = reportData;
      
      const doc = new PDFDocument({ margin: 50 });
      const filePath = path.join(this.exportDir, filename);
      const stream = require('fs').createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Header
      this._addPDFHeader(doc, 'Task Analytics Report');
      
      // Report period
      doc
        .fontSize(10)
        .text(`Report Period: ${report_period.start_date} to ${report_period.end_date}`, { align: 'right' })
        .moveDown();
      
      // Overview
      this._addPDFSection(doc, 'Overview');
      doc
        .fontSize(11)
        .text(`Total Tasks Created: ${overview.total_tasks_created}`)
        .text(`Total Assignments: ${overview.total_assignments}`)
        .text(`Completed Assignments: ${overview.completed_assignments}`)
        .text(`Overall Completion Rate: ${overview.overall_completion_rate}%`)
        .text(`Total Points Awarded: ${overview.total_points_awarded}`)
        .text(`Average Completion Time: ${parseFloat(overview.avg_completion_time_hours).toFixed(1)} hours`)
        .moveDown();
      
      // Category breakdown
      if (category_breakdown && category_breakdown.length > 0) {
        this._addPDFSection(doc, 'Performance by Category');
        
        category_breakdown.forEach(cat => {
          doc
            .fontSize(10)
            .text(`${cat.category}: ${cat.total_tasks} tasks, ${cat.completion_rate}% completion rate`);
        });
        
        doc.moveDown();
      }
      
      // Top tasks
      if (top_tasks && top_tasks.length > 0) {
        this._addPDFSection(doc, 'Most Assigned Tasks');
        
        top_tasks.slice(0, 10).forEach((task, index) => {
          doc
            .fontSize(10)
            .text(`${index + 1}. ${task.title} (${task.times_assigned} assignments, ${task.times_completed} completed)`);
        });
      }
      
      // Footer
      this._addPDFFooter(doc);
      
      doc.end();
      
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
      
      return {
        success: true,
        file_path: filePath,
        filename: filename,
        format: 'PDF'
      };
      
    } catch (error) {
      console.error('Error exporting task analytics to PDF:', error);
      throw error;
    }
  }
  
  /**
   * Export family summary report to PDF
   * @param {Object} reportData - Report data to export
   * @param {String} filename - Output filename
   * @returns {String} - File path
   */
  async exportFamilySummaryToPDF(reportData, filename = 'family_summary.pdf') {
    try {
      const { family_info, activity_stats, top_children, report_period } = reportData;
      
      const doc = new PDFDocument({ margin: 50 });
      const filePath = path.join(this.exportDir, filename);
      const stream = require('fs').createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Header
      this._addPDFHeader(doc, 'Family Activity Summary Report');
      
      // Report period
      doc
        .fontSize(10)
        .text(`Report Period: ${report_period.start_date} to ${report_period.end_date}`, { align: 'right' })
        .moveDown();
      
      // Family info
      this._addPDFSection(doc, 'Family Information');
      doc
        .fontSize(11)
        .text(`Family Name: ${family_info.family_name}`)
        .text(`Family Code: ${family_info.family_code}`)
        .text(`Total Members: ${family_info.total_members}`)
        .text(`Children: ${family_info.children_count}`)
        .text(`Total Family Points: ${family_info.total_family_points}`)
        .moveDown();
      
      // Activity statistics
      this._addPDFSection(doc, 'Activity Statistics');
      doc
        .fontSize(11)
        .text(`Tasks Created: ${activity_stats.total_tasks_created}`)
        .text(`Total Assignments: ${activity_stats.total_assignments}`)
        .text(`Completed Tasks: ${activity_stats.completed_tasks}`)
        .text(`Total Points Earned: ${activity_stats.total_points_earned}`)
        .text(`Total Points Spent: ${activity_stats.total_points_spent}`)
        .text(`Available Rewards: ${activity_stats.total_rewards_available}`)
        .text(`Redemption Requests: ${activity_stats.total_redemption_requests}`)
        .moveDown();
      
      // Top performers
      if (top_children && top_children.length > 0) {
        this._addPDFSection(doc, 'Top Performing Children');
        
        top_children.forEach((child, index) => {
          doc
            .fontSize(10)
            .text(`${index + 1}. ${child.full_name}: ${child.tasks_completed} tasks completed (${child.completion_rate}% rate)`);
        });
      }
      
      // Footer
      this._addPDFFooter(doc);
      
      doc.end();
      
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
      
      return {
        success: true,
        file_path: filePath,
        filename: filename,
        format: 'PDF'
      };
      
    } catch (error) {
      console.error('Error exporting family summary to PDF:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  
  /**
   * Ensure export directory exists
   * @private
   */
  async _ensureExportDirectory() {
    try {
      await fs.mkdir(this.exportDir, { recursive: true });
    } catch (error) {
      console.error('Error creating export directory:', error);
    }
  }
  
  /**
   * Convert data to CSV format
   * @private
   */
  _convertToCSV(data) {
    try {
      const fields = Object.keys(data[0]);
      const parser = new Parser({ fields });
      return parser.parse(data);
    } catch (error) {
      // Fallback to manual CSV generation
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      return [headers, ...rows].join('\n');
    }
  }
  
  /**
   * Save file to disk
   * @private
   */
  async _saveFile(filename, content) {
    const filePath = path.join(this.exportDir, filename);
    await fs.writeFile(filePath, content, 'utf8');
    return filePath;
  }
  
  /**
   * Add PDF header
   * @private
   */
  _addPDFHeader(doc, title) {
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(title, { align: 'center' })
      .moveDown()
      .fontSize(10)
      .font('Helvetica')
      .text('TaskBuddy - Family Activity Management System', { align: 'center' })
      .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(2);
  }
  
  /**
   * Add PDF section header
   * @private
   */
  _addPDFSection(doc, sectionTitle) {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(sectionTitle)
      .moveDown(0.5)
      .font('Helvetica');
  }
  
  /**
   * Add PDF footer
   * @private
   */
  _addPDFFooter(doc) {
    const bottom = doc.page.height - 50;
    doc
      .fontSize(8)
      .text(
        'This report is generated by TaskBuddy © 2026',
        50,
        bottom,
        { align: 'center', width: doc.page.width - 100 }
      );
  }
  
  /**
   * Delete exported file after download
   * @param {String} filePath - File path to delete
   */
  async deleteExportedFile(filePath) {
    try {
      await fs.unlink(filePath);
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('Error deleting exported file:', error);
      return { success: false, message: 'Failed to delete file' };
    }
  }
  
  /**
   * List all exported files
   */
  async listExportedFiles() {
    try {
      const files = await fs.readdir(this.exportDir);
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.exportDir, file);
          const stats = await fs.stat(filePath);
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            path: filePath
          };
        })
      );
      
      return { success: true, files: fileDetails };
    } catch (error) {
      console.error('Error listing exported files:', error);
      return { success: false, files: [] };
    }
  }
  
  /**
   * Clean up old export files (older than 24 hours)
   */
  async cleanupOldExports() {
    try {
      const files = await fs.readdir(this.exportDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.exportDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.birthtimeMs > maxAge) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
      
      return {
        success: true,
        message: `Cleaned up ${deletedCount} old export file(s)`
      };
      
    } catch (error) {
      console.error('Error cleaning up old exports:', error);
      return { success: false, message: 'Failed to cleanup old exports' };
    }
  }
}

module.exports = new ExportService();
