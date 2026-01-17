# TaskBuddy Analytics Implementation Guide

**Author:** Souleymane Camara - BIT1007326  
**Institution:** Regional Maritime University  
**Last Updated:** January 2026

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Performance Scoring System](#performance-scoring-system)
4. [Engagement Metrics](#engagement-metrics)
5. [Trend Analysis](#trend-analysis)
6. [Predictive Analytics](#predictive-analytics)
7. [Data Visualization](#data-visualization)
8. [Implementation Examples](#implementation-examples)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

The TaskBuddy Analytics System provides comprehensive insights into family activity, child performance, and task completion patterns. This guide explains how the analytics system works and how to implement it in your application.

### Key Features

- **Multi-Factor Performance Scoring**: Weighted scoring across 4 dimensions
- **Family Engagement Analysis**: Overall family activity metrics
- **Trend Detection**: Identify improving/declining performance
- **Predictive Analytics**: Forecast task completion and activity
- **Comparative Analysis**: Compare children within a family

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend Layer                         │
│  (React Components, Charts, Dashboards)                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 API Routes Layer                         │
│  (/api/analytics/*, /api/reports/*)                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Controllers Layer                           │
│  (analytics.controller.js, report.controller.js)         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Services Layer                              │
│  (analytics.service.js, report.service.js)               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            Database Queries Layer                        │
│  (childPerformance.queries.js, etc.)                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                PostgreSQL Database                        │
│  (Tasks, Assignments, Rewards, Points Log)               │
└──────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Frontend** makes API request with parameters
2. **Routes** validate and forward to controller
3. **Controller** processes request, calls service
4. **Service** implements business logic, calls queries
5. **Queries** retrieve data from database
6. **Formatters** transform data for visualization
7. **Response** returned through layers to frontend

---

## Performance Scoring System

### Overview

The performance scoring system evaluates child performance across 4 weighted dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **Completion** | 35% | Percentage of tasks completed |
| **Punctuality** | 25% | On-time completion rate |
| **Quality** | 25% | First-time approval rate |
| **Consistency** | 15% | Regular participation |

### Formula

```
Overall Score = (Completion × 0.35) + (Punctuality × 0.25) + 
                (Quality × 0.25) + (Consistency × 0.15)
```

### Score Calculations

#### 1. Completion Score

```javascript
completionScore = (completed_tasks / total_tasks) × 100
```

**Example:**
- Total tasks: 20
- Completed: 16
- Score: (16/20) × 100 = **80.00**

#### 2. Punctuality Score

```javascript
ontimeRate = (ontime_completions / completed_tasks) × 100
overdueImpact = (overdue_tasks / total_tasks) × 20  // Penalty

punctualityScore = max(ontimeRate - overdueImpact, 0)
```

**Example:**
- Completed tasks: 16
- On-time completions: 14
- Overdue tasks: 2
- Total tasks: 20
- On-time rate: (14/16) × 100 = 87.5%
- Overdue penalty: (2/20) × 20 = 2%
- Score: 87.5 - 2 = **85.50**

#### 3. Quality Score

```javascript
approvalRate = (completed_tasks / (completed_tasks + rejected_tasks)) × 100
```

**Example:**
- Completed: 16
- Rejected: 2
- Score: (16/18) × 100 = **88.89**

#### 4. Consistency Score

```javascript
participationRate = (active_days / total_days_in_period) × 100
```

**Example:**
- Active days: 20
- Period: 30 days
- Score: (20/30) × 100 = **66.67**

### Overall Score Example

```
Completion: 80.00 × 0.35 = 28.00
Punctuality: 85.50 × 0.25 = 21.38
Quality: 88.89 × 0.25 = 22.22
Consistency: 66.67 × 0.15 = 10.00
───────────────────────────────
Overall Score = 81.60
Rating: Very Good
```

### Performance Ratings

| Score Range | Rating |
|-------------|--------|
| 90 - 100 | Excellent |
| 75 - 89 | Very Good |
| 60 - 74 | Good |
| 45 - 59 | Fair |
| 0 - 44 | Needs Improvement |

### Implementation

```javascript
// Calculate performance score
const result = await analyticsService.calculatePerformanceScore({
  child_id: 1,
  family_id: 1,
  start_date: '2025-01-01',
  end_date: '2025-01-31'
});

console.log(result.data.overall_score);  // 81.60
console.log(result.data.rating);          // "Very Good"
console.log(result.data.breakdown);       // Individual scores
```

---

## Engagement Metrics

### Family Engagement Score

Evaluates overall family activity and participation.

#### Components

| Metric | Weight | Description |
|--------|--------|-------------|
| **Task Activity** | 35% | Task creation and assignment rate |
| **Child Participation** | 30% | Children completing tasks |
| **Parent Involvement** | 20% | Parent task creation/review activity |
| **Reward Activity** | 15% | Reward redemption activity |

#### Calculation

```javascript
taskActivityScore = min(tasksPerDay × 10, 50) + 
                    (assignmentRate × 25) + 
                    (completionRate × 25)

childParticipationScore = (childrenParticipatingRate × 50) + 
                          (completionRate × 50)

parentInvolvementScore = min(taskCreationRate × 20, 100)

rewardActivityScore = min(redemptionRate × 20, 100)

engagementScore = (taskActivityScore × 0.35) +
                  (childParticipationScore × 0.30) +
                  (parentInvolvementScore × 0.20) +
                  (rewardActivityScore × 0.15)
```

#### Engagement Levels

| Score | Level |
|-------|-------|
| 80+ | Highly Engaged |
| 60-79 | Engaged |
| 40-59 | Moderately Engaged |
| 0-39 | Low Engagement |

#### Recommendations

The system automatically provides recommendations based on engagement scores:

```javascript
if (score < 60) {
  recommendations.push('Create more engaging tasks with appropriate rewards');
  recommendations.push('Ensure tasks are age-appropriate');
}

if (active_children < 2) {
  recommendations.push('Encourage all children to participate regularly');
}

if (redemption_requests === 0) {
  recommendations.push('Review reward catalog appeal');
}
```

---

## Trend Analysis

### Trend Detection

The system analyzes historical performance to identify trends.

#### Trend Directions

1. **Improving**: Recent performance > Previous by 5%+
2. **Declining**: Recent performance < Previous by 5%+
3. **Stable**: Performance variance < 5%

#### Calculation

```javascript
trend_direction = (recent_rate - previous_rate) > 5 ? 'Improving' :
                  (recent_rate - previous_rate) < -5 ? 'Declining' :
                  'Stable'

rate_of_change = ((recent_rate - previous_rate) / previous_rate) × 100
```

#### Example

```javascript
// Historical data
const trendData = [
  { month: '2025-03', completion_rate: 85 },
  { month: '2025-02', completion_rate: 75 },
  { month: '2025-01', completion_rate: 70 }
];

// Analysis
trend_direction = 'Improving'
rate_of_change = ((85 - 75) / 75) × 100 = 13.33%
```

### Next Period Prediction

Simple linear regression for forecasting:

```javascript
avgChange = sum(changes) / number_of_changes

predictedRate = current_rate + avgChange
```

**Example:**
```javascript
// Changes: +10%, +5%
avgChange = (10 + 5) / 2 = 7.5%
current_rate = 85%
predicted_rate = 85 + 7.5 = 92.5%
```

---

## Predictive Analytics

### Task Completion Prediction

Predicts probability of task completion based on historical patterns.

#### Factors Considered

1. **Child's Historical Performance**: Overall completion rate
2. **Task Priority**: Higher priority = higher completion likelihood
3. **Task Category**: Performance in similar categories
4. **Time Available**: Deadline proximity

#### Prediction Algorithm

```javascript
baseCompletionRate = child_completion_history_rate

priorityBonus = priority === 'urgent' ? 10 :
                priority === 'high' ? 5 :
                priority === 'medium' ? 0 : -5

categoryPerformance = completion_rate_for_category

completionProbability = (baseCompletionRate × 0.6) +
                       (categoryPerformance × 0.3) +
                       (priorityBonus × 0.1)
```

#### Confidence Levels

| Historical Tasks | Confidence |
|------------------|------------|
| 20+ | High |
| 10-19 | Medium |
| 1-9 | Low |

### Activity Forecasting

Forecast family activity for the next period.

```javascript
// Historical average
avgTasksPerDay = total_tasks / total_days

// Forecast next 30 days
forecastedTasks = avgTasksPerDay × 30

// Apply trend adjustment
if (trend === 'Improving') {
  forecastedTasks *= 1.1  // 10% increase
} else if (trend === 'Declining') {
  forecastedTasks *= 0.9  // 10% decrease
}
```

---

## Data Visualization

### Chart Types Supported

1. **Line Charts**: Time-based trends
2. **Bar Charts**: Category comparisons
3. **Pie Charts**: Distribution
4. **Doughnut Charts**: Status breakdown
5. **Radar Charts**: Multi-metric performance
6. **Gauge Charts**: Score visualization

### Chart Data Formatting

#### Line Chart Example

```javascript
const chartData = formatLineChartData(
  monthlyData,
  'month',                          // X-axis key
  ['tasks_assigned', 'completed'],  // Y-axis keys
  ['Assigned', 'Completed']         // Labels
);

// Output:
{
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    {
      label: 'Assigned',
      data: [10, 12, 15],
      borderColor: 'rgba(54, 162, 235, 1)'
    },
    {
      label: 'Completed',
      data: [8, 10, 13],
      borderColor: 'rgba(75, 192, 192, 1)'
    }
  ]
}
```

#### Pie Chart Example

```javascript
const chartData = formatPieChartData(
  statusData,
  'status',    // Label key
  'count'      // Value key
);

// Output:
{
  labels: ['Pending', 'Completed', 'Rejected'],
  datasets: [{
    data: [5, 15, 2],
    backgroundColor: [
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(255, 99, 132, 0.6)'
    ]
  }]
}
```

#### Radar Chart Example

```javascript
const radarData = formatChildPerformanceRadar({
  completion_rate: 85,
  punctuality_score: 80,
  quality_score: 90,
  consistency_score: 70
});

// Output:
{
  labels: ['Completion', 'Punctuality', 'Quality', 'Consistency'],
  datasets: [{
    label: 'Performance Metrics',
    data: [85, 80, 90, 70],
    backgroundColor: 'rgba(54, 162, 235, 0.2)',
    borderColor: 'rgb(54, 162, 235)'
  }]
}
```

### Frontend Integration

#### React with Chart.js

```jsx
import { Line } from 'react-chartjs-2';
import { formatMonthlyTrendChart } from '../utils/chartFormatters';

function PerformanceTrendChart({ childId, familyId }) {
  const [chartData, setChartData] = useState(null);
  
  useEffect(() => {
    async function loadData() {
      const response = await fetch(
        `/api/analytics/charts/monthly-trend?child_id=${childId}&family_id=${familyId}`
      );
      const data = await response.json();
      setChartData(data.data);
    }
    loadData();
  }, [childId, familyId]);
  
  if (!chartData) return <div>Loading...</div>;
  
  return (
    <Line 
      data={chartData}
      options={{
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Performance Trend'
          }
        }
      }}
    />
  );
}
```

---

## Implementation Examples

### Example 1: Child Dashboard Performance Summary

```javascript
async function getChildDashboardData(childId, familyId) {
  // Get performance score
  const scoreResponse = await fetch(
    `/api/analytics/performance-score?child_id=${childId}&family_id=${familyId}&date_preset=this_month`
  );
  const scoreData = await scoreResponse.json();
  
  // Get monthly trend
  const trendResponse = await fetch(
    `/api/analytics/performance-trend?child_id=${childId}&family_id=${familyId}&period=monthly`
  );
  const trendData = await trendResponse.json();
  
  // Get chart data
  const chartResponse = await fetch(
    `/api/analytics/charts/monthly-trend?child_id=${childId}&family_id=${familyId}&months=6`
  );
  const chartData = await chartResponse.json();
  
  return {
    score: scoreData.data,
    trend: trendData.data,
    chart: chartData.data
  };
}
```

### Example 2: Family Comparison Dashboard

```javascript
async function getFamilyComparisonData(familyId) {
  // Get all children performance
  const comparisonResponse = await fetch(
    `/api/analytics/children-comparison?family_id=${familyId}&date_preset=this_month`
  );
  const comparison = await comparisonResponse.json();
  
  // Get family engagement
  const engagementResponse = await fetch(
    `/api/analytics/family-engagement?family_id=${familyId}&date_preset=this_month`
  );
  const engagement = await engagementResponse.json();
  
  return {
    rankings: comparison.data.rankings,
    topPerformer: comparison.data.top_performer,
    engagement: engagement.data
  };
}
```

### Example 3: Export Performance Report

```javascript
async function exportChildReport(childId, familyId) {
  // Generate and export to PDF
  const response = await fetch(
    '/api/export/pdf/child-performance',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        child_id: childId,
        family_id: familyId,
        filename: `child_${childId}_report_${Date.now()}.pdf`,
        date_preset: 'this_month'
      })
    }
  );
  
  const data = await response.json();
  
  // Download the file
  window.location.href = `/api/export/download/${data.data.filename}`;
}
```

---

## Best Practices

### 1. Performance Optimization

```javascript
// ✅ Good: Use date presets when possible
const data = await getReport({ date_preset: 'last_30_days' });

// ❌ Avoid: Fetching all-time data unnecessarily
const data = await getReport({ date_preset: 'all_time' });
```

### 2. Caching Strategy

```javascript
// Cache frequently accessed reports
const cacheKey = `report_${childId}_${familyId}_${datePreset}`;
let data = cache.get(cacheKey);

if (!data) {
  data = await generateReport(...);
  cache.set(cacheKey, data, 300); // Cache for 5 minutes
}
```

### 3. Error Handling

```javascript
async function safeGetReport(params) {
  try {
    const response = await fetch('/api/reports/child-performance', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      params: params
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Report generation failed:', error);
    
    // Return fallback data
    return {
      success: false,
      message: 'Unable to generate report',
      data: null
    };
  }
}
```

### 4. Data Validation

```javascript
// Always validate IDs before making requests
function validateParams({ childId, familyId }) {
  if (!childId || childId < 1) {
    throw new Error('Invalid child_id');
  }
  if (!familyId || familyId < 1) {
    throw new Error('Invalid family_id');
  }
}
```

### 5. Progressive Loading

```javascript
// Load summary first, then details
async function loadDashboard(childId, familyId) {
  // Quick summary
  const summary = await getPerformanceSummary(childId, familyId);
  renderSummary(summary);
  
  // Detailed analytics (loads in background)
  const analytics = await getDetailedAnalytics(childId, familyId);
  renderAnalytics(analytics);
  
  // Charts (loads last)
  const charts = await getChartData(childId, familyId);
  renderCharts(charts);
}
```

---

## Troubleshooting

### Common Issues

#### 1. No Data Returned

**Problem:** Report returns empty data

**Solution:**
```javascript
// Check if child has any task assignments
const hasData = await checkChildHasAssignments(childId, familyId);

if (!hasData) {
  return {
    message: 'No task data available for this period',
    suggestion: 'Try a different date range or assign some tasks first'
  };
}
```

#### 2. Incorrect Performance Score

**Problem:** Score doesn't match expectations

**Debug:**
```javascript
// Log breakdown to identify issue
console.log('Completion:', breakdown.completion.score);
console.log('Punctuality:', breakdown.punctuality.score);
console.log('Quality:', breakdown.quality.score);
console.log('Consistency:', breakdown.consistency.score);

// Verify calculations
const manual = (
  breakdown.completion.score * 0.35 +
  breakdown.punctuality.score * 0.25 +
  breakdown.quality.score * 0.25 +
  breakdown.consistency.score * 0.15
);
console.log('Manual calculation:', manual);
```

#### 3. Slow Report Generation

**Problem:** Reports take too long to generate

**Solutions:**
1. Use database indexes on commonly queried columns
2. Implement report caching
3. Use date range limits
4. Paginate large result sets

```sql
-- Add indexes for performance
CREATE INDEX idx_ta_child_date ON task_assignments(assigned_to, assigned_at);
CREATE INDEX idx_ta_status ON task_assignments(status);
```

#### 4. Chart Data Not Rendering

**Problem:** Chart shows no data

**Debug:**
```javascript
// Verify data format
console.log('Chart data:', chartData);

// Check required properties
if (!chartData.labels || !chartData.datasets) {
  console.error('Invalid chart data format');
}

// Verify data arrays have values
chartData.datasets.forEach((dataset, i) => {
  console.log(`Dataset ${i}:`, dataset.data);
});
```

---

## Summary

The TaskBuddy Analytics System provides:

✅ **Multi-dimensional performance scoring**  
✅ **Comprehensive engagement metrics**  
✅ **Trend detection and prediction**  
✅ **Chart-ready data formatting**  
✅ **Flexible date range filtering**  
✅ **Export capabilities (CSV/PDF)**

For additional support or questions, refer to the API documentation or contact the development team.

---

**Author:** Souleymane Camara - BIT1007326  
**Last Updated:** January 17, 2026
