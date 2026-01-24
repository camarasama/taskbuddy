// ============================================================================
// PDF Generator Utilities
// Helper functions for creating professional PDF reports
// Author: Souleymane Camara - BIT1007326
// ============================================================================

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ============================================================================
// COLOR SCHEME
// ============================================================================

const COLORS = {
  primary: '#4F46E5',      // Indigo
  secondary: '#10B981',    // Green
  warning: '#F59E0B',      // Amber
  danger: '#EF4444',       // Red
  dark: '#1F2937',         // Gray-800
  medium: '#6B7280',       // Gray-500
  light: '#F3F4F6',        // Gray-100
  white: '#FFFFFF',
  success: '#10B981',
  info: '#3B82F6'
};

// ============================================================================
// PDF CONFIGURATION
// ============================================================================

const PDF_CONFIG = {
  size: 'A4',
  margins: {
    top: 60,
    bottom: 60,
    left: 50,
    right: 50
  },
  fonts: {
    bold: 'Helvetica-Bold',
    normal: 'Helvetica',
    italic: 'Helvetica-Oblique'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a new PDF document
 */
const createDocument = () => {
  return new PDFDocument({
    size: PDF_CONFIG.size,
    margins: PDF_CONFIG.margins,
    bufferPages: true,
    autoFirstPage: true
  });
};

/**
 * Add header to PDF
 */
const addHeader = (doc, title, subtitle = '') => {
  // Header background
  doc
    .rect(0, 0, doc.page.width, 120)
    .fill(COLORS.primary);

  // Title
  doc
    .font(PDF_CONFIG.fonts.bold)
    .fontSize(24)
    .fillColor(COLORS.white)
    .text(title, 50, 40, { width: doc.page.width - 100 });

  // Subtitle
  if (subtitle) {
    doc
      .font(PDF_CONFIG.fonts.normal)
      .fontSize(12)
      .fillColor(COLORS.white)
      .text(subtitle, 50, 75, { width: doc.page.width - 100 });
  }

  // TaskBuddy Logo/Text (right aligned)
  doc
    .font(PDF_CONFIG.fonts.bold)
    .fontSize(16)
    .fillColor(COLORS.white)
    .text('TaskBuddy', doc.page.width - 150, 45, { width: 100, align: 'right' });

  // Move cursor below header
  doc.y = 140;
};

/**
 * Add footer to PDF with page numbers
 */
const addFooter = (doc) => {
  const pages = doc.bufferedPageRange();
  
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);

    // Footer line
    doc
      .strokeColor(COLORS.light)
      .lineWidth(1)
      .moveTo(50, doc.page.height - 50)
      .lineTo(doc.page.width - 50, doc.page.height - 50)
      .stroke();

    // Page number
    doc
      .font(PDF_CONFIG.fonts.normal)
      .fontSize(10)
      .fillColor(COLORS.medium)
      .text(
        `Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 40,
        { align: 'center', width: doc.page.width - 100 }
      );

    // Generated date (left)
    doc
      .fontSize(9)
      .text(
        `Generated: ${new Date().toLocaleDateString()}`,
        50,
        doc.page.height - 40,
        { align: 'left', width: 200 }
      );

    // TaskBuddy footer (right)
    doc
      .text(
        'TaskBuddy Report',
        doc.page.width - 150,
        doc.page.height - 40,
        { align: 'right', width: 100 }
      );
  }
};

/**
 * Add section heading
 */
const addSectionHeading = (doc, title, color = COLORS.primary) => {
  // Check if we need a new page
  if (doc.y > doc.page.height - 150) {
    doc.addPage();
  }

  doc
    .font(PDF_CONFIG.fonts.bold)
    .fontSize(16)
    .fillColor(color)
    .text(title, 50, doc.y + 20);

  // Underline
  doc
    .strokeColor(color)
    .lineWidth(2)
    .moveTo(50, doc.y + 5)
    .lineTo(250, doc.y + 5)
    .stroke();

  doc.moveDown(1);
};

/**
 * Add key-value pair
 */
const addKeyValue = (doc, key, value, options = {}) => {
  const startY = doc.y;
  const { bold = false, color = COLORS.dark, indent = 0 } = options;

  // Key
  doc
    .font(PDF_CONFIG.fonts.bold)
    .fontSize(11)
    .fillColor(COLORS.medium)
    .text(key + ':', 50 + indent, startY, { continued: false });

  // Value
  doc
    .font(bold ? PDF_CONFIG.fonts.bold : PDF_CONFIG.fonts.normal)
    .fontSize(11)
    .fillColor(color)
    .text(value, 200 + indent, startY);

  doc.moveDown(0.5);
};

/**
 * Add statistics grid (4 columns)
 */
const addStatsGrid = (doc, stats) => {
  if (doc.y > doc.page.height - 200) {
    doc.addPage();
  }

  const startY = doc.y;
  const boxWidth = (doc.page.width - 100 - 30) / 4; // 4 columns with gaps
  const boxHeight = 80;

  stats.forEach((stat, index) => {
    const x = 50 + (index * (boxWidth + 10));
    const y = startY;

    // Box background
    doc
      .rect(x, y, boxWidth, boxHeight)
      .fillAndStroke(COLORS.light, COLORS.medium);

    // Value (large, centered)
    doc
      .font(PDF_CONFIG.fonts.bold)
      .fontSize(24)
      .fillColor(stat.color || COLORS.primary)
      .text(stat.value, x, y + 20, { width: boxWidth, align: 'center' });

    // Label (small, centered)
    doc
      .font(PDF_CONFIG.fonts.normal)
      .fontSize(10)
      .fillColor(COLORS.medium)
      .text(stat.label, x, y + 55, { width: boxWidth, align: 'center' });
  });

  doc.y = startY + boxHeight + 20;
};

/**
 * Add data table
 */
const addTable = (doc, headers, rows, options = {}) => {
  const { columnWidths, headerColor = COLORS.primary } = options;

  if (doc.y > doc.page.height - 200) {
    doc.addPage();
  }

  const tableTop = doc.y;
  const tableWidth = doc.page.width - 100;
  const rowHeight = 30;
  
  // Calculate column widths
  const colWidths = columnWidths || headers.map(() => tableWidth / headers.length);

  // Draw header row
  let x = 50;
  doc
    .rect(50, tableTop, tableWidth, rowHeight)
    .fill(headerColor);

  headers.forEach((header, i) => {
    doc
      .font(PDF_CONFIG.fonts.bold)
      .fontSize(10)
      .fillColor(COLORS.white)
      .text(header, x + 5, tableTop + 10, { width: colWidths[i] - 10 });
    x += colWidths[i];
  });

  // Draw data rows
  let y = tableTop + rowHeight;
  
  rows.forEach((row, rowIndex) => {
    // Alternate row colors
    const bgColor = rowIndex % 2 === 0 ? COLORS.white : COLORS.light;
    
    doc
      .rect(50, y, tableWidth, rowHeight)
      .fill(bgColor);

    x = 50;
    row.forEach((cell, colIndex) => {
      doc
        .font(PDF_CONFIG.fonts.normal)
        .fontSize(9)
        .fillColor(COLORS.dark)
        .text(String(cell), x + 5, y + 10, { 
          width: colWidths[colIndex] - 10,
          ellipsis: true 
        });
      x += colWidths[colIndex];
    });

    y += rowHeight;

    // Add new page if needed
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 60;
    }
  });

  doc.y = y + 10;
};

/**
 * Add progress bar
 */
const addProgressBar = (doc, label, percentage, options = {}) => {
  const { 
    width = 300, 
    height = 20,
    color = COLORS.success,
    showPercentage = true 
  } = options;

  const x = 50;
  const y = doc.y;

  // Label
  doc
    .font(PDF_CONFIG.fonts.normal)
    .fontSize(11)
    .fillColor(COLORS.dark)
    .text(label, x, y);

  // Background bar
  doc
    .rect(x, y + 20, width, height)
    .fillAndStroke(COLORS.light, COLORS.medium);

  // Progress bar
  const progressWidth = (percentage / 100) * width;
  doc
    .rect(x, y + 20, progressWidth, height)
    .fill(color);

  // Percentage text
  if (showPercentage) {
    doc
      .font(PDF_CONFIG.fonts.bold)
      .fontSize(10)
      .fillColor(COLORS.white)
      .text(
        `${percentage}%`,
        x,
        y + 25,
        { width: progressWidth, align: 'center' }
      );
  }

  doc.y = y + height + 30;
};

/**
 * Add simple bar chart
 */
const addBarChart = (doc, title, data, options = {}) => {
  if (doc.y > doc.page.height - 300) {
    doc.addPage();
  }

  const {
    width = 400,
    height = 200,
    color = COLORS.primary
  } = options;

  const startX = 50;
  const startY = doc.y + 30;

  // Title
  doc
    .font(PDF_CONFIG.fonts.bold)
    .fontSize(12)
    .fillColor(COLORS.dark)
    .text(title, startX, doc.y);

  // Chart background
  doc
    .rect(startX, startY, width, height)
    .stroke(COLORS.medium);

  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = width / data.length - 10;

  // Draw bars
  data.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * (height - 40);
    const x = startX + (index * (width / data.length)) + 5;
    const y = startY + height - barHeight - 20;

    // Bar
    doc
      .rect(x, y, barWidth, barHeight)
      .fill(color);

    // Value on top
    doc
      .font(PDF_CONFIG.fonts.bold)
      .fontSize(9)
      .fillColor(COLORS.dark)
      .text(String(item.value), x, y - 15, { width: barWidth, align: 'center' });

    // Label at bottom
    doc
      .font(PDF_CONFIG.fonts.normal)
      .fontSize(8)
      .fillColor(COLORS.medium)
      .text(
        item.label,
        x,
        startY + height - 15,
        { width: barWidth, align: 'center', ellipsis: true }
      );
  });

  doc.y = startY + height + 30;
};

/**
 * Add badge/tag
 */
const addBadge = (doc, text, x, y, color = COLORS.primary) => {
  const padding = 5;
  const textWidth = doc.widthOfString(text) + padding * 2;
  const badgeHeight = 20;

  // Badge background
  doc
    .roundedRect(x, y, textWidth, badgeHeight, 3)
    .fill(color);

  // Badge text
  doc
    .font(PDF_CONFIG.fonts.bold)
    .fontSize(9)
    .fillColor(COLORS.white)
    .text(text, x + padding, y + 5);

  return textWidth + 10; // Return width for positioning next badge
};

/**
 * Add info box
 */
const addInfoBox = (doc, title, content, options = {}) => {
  const {
    borderColor = COLORS.info,
    backgroundColor = COLORS.light,
    icon = 'ℹ'
  } = options;

  if (doc.y > doc.page.height - 150) {
    doc.addPage();
  }

  const startY = doc.y;
  const boxHeight = 80;
  const boxWidth = doc.page.width - 100;

  // Box
  doc
    .roundedRect(50, startY, boxWidth, boxHeight, 5)
    .fillAndStroke(backgroundColor, borderColor);

  // Icon
  doc
    .font(PDF_CONFIG.fonts.bold)
    .fontSize(20)
    .fillColor(borderColor)
    .text(icon, 60, startY + 10);

  // Title
  doc
    .font(PDF_CONFIG.fonts.bold)
    .fontSize(12)
    .fillColor(COLORS.dark)
    .text(title, 90, startY + 15);

  // Content
  doc
    .font(PDF_CONFIG.fonts.normal)
    .fontSize(10)
    .fillColor(COLORS.medium)
    .text(content, 90, startY + 35, { width: boxWidth - 50 });

  doc.y = startY + boxHeight + 20;
};

/**
 * Add metadata section
 */
const addMetadata = (doc, metadata) => {
  doc.y = 140; // After header
  
  doc
    .font(PDF_CONFIG.fonts.normal)
    .fontSize(10)
    .fillColor(COLORS.medium);

  Object.entries(metadata).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 50, doc.y, { continued: false });
    doc.moveDown(0.3);
  });

  doc.moveDown(1);
  
  // Separator line
  doc
    .strokeColor(COLORS.light)
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .stroke();

  doc.moveDown(1);
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  COLORS,
  PDF_CONFIG,
  createDocument,
  addHeader,
  addFooter,
  addSectionHeading,
  addKeyValue,
  addStatsGrid,
  addTable,
  addProgressBar,
  addBarChart,
  addBadge,
  addInfoBox,
  addMetadata
};
