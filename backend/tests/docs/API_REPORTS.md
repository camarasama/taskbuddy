# TaskBuddy Reports API Documentation

**Version:** 1.0  
**Author:** Souleymane Camara - BIT1007326  
**Last Updated:** January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Date Ranges](#date-ranges)
4. [Report Endpoints](#report-endpoints)
5. [Analytics Endpoints](#analytics-endpoints)
6. [Export Endpoints](#export-endpoints)
7. [Chart Data Endpoints](#chart-data-endpoints)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [Examples](#examples)

---

## Overview

The TaskBuddy Reports API provides comprehensive reporting and analytics capabilities for family activity management. The API supports:

- **5 Main Report Types**: Child Performance, Task Analytics, Reward Analytics, Family Summary, Parent Activity
- **Advanced Analytics**: Performance scoring, engagement metrics, trend analysis
- **Multiple Export Formats**: CSV and PDF
- **12+ Date Range Presets**: Plus custom date ranges
- **Chart-Ready Data**: Formatted data for visualization

**Base URL:** `http://localhost:5000/api`

---

## Authentication

All report endpoints require authentication using JWT Bearer tokens.

### Headers Required

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Example

```bash
curl -H "Authorization: Bearer eyJhbGc..." \
     http://localhost:5000/api/reports/child-performance
```

---

## Date Ranges

All report endpoints support flexible date range filtering.

### Date Presets

| Preset | Description |
|--------|-------------|
| `today` | Current day |
| `yesterday` | Previous day |
| `this_week` | Current week (Monday - Sunday) |
| `last_week` | Previous week |
| `this_month` | Current month |
| `last_month` | Previous month |
| `last_7_days` | Last 7 days |
| `last_30_days` | Last 30 days |
| `last_90_days` | Last 90 days |
| `this_year` | Current year |
| `last_year` | Previous year |
| `all_time` | All available data |
| `custom` | Custom date range (requires start_date & end_date) |

### Query Parameters

```
?date_preset=last_30_days
```

### Custom Date Range

```
?date_preset=custom&start_date=2025-01-01T00:00:00Z&end_date=2025-01-31T23:59:59Z
```

---

## Report Endpoints

### 1. Child Performance Report

Generate a comprehensive performance report for a child.

**Endpoint:** `GET /api/reports/child-performance`

**Query Parameters:**
- `child_id` (required): Child user ID
- `family_id` (required): Family ID
- `date_preset` (optional): Date range preset
- `start_date` (optional): Custom start date (ISO 8601)
- `end_date` (optional): Custom end date (ISO 8601)

**Response:**

```json
{
  "success": true,
  "message": "Child performance report generated successfully",
  "data": {
    "report_type": "Child Performance Report",
    "generated_at": "2026-01-17T10:30:00.000Z",
    "report_period": {
      "start_date": "2025-01-01",
      "end_date": "2026-01-17"
    },
    "summary": {
      "child_name": "John Doe",
      "current_points": 150,
      "total_tasks_assigned": 20,
      "tasks_completed": 16,
      "tasks_pending": 2,
      "tasks_rejected": 1,
      "completion_rate": 80.00,
      "total_points_earned": 320,
      "avg_points_per_task": 20.00,
      "avg_completion_time_hours": 24.5
    },
    "performance_metrics": {
      "completion_rate": "80.00%",
      "first_time_approval_rate": "87.50%",
      "on_time_completions": 14,
      "late_completions": 2,
      "punctuality_score": 87.5
    },
    "recent_activity": [...],
    "priority_distribution": [...],
    "monthly_trends": [...]
  }
}
```

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/reports/child-performance?child_id=1&family_id=1&date_preset=last_30_days" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Task Analytics Report

Generate analytics for all tasks in a family.

**Endpoint:** `GET /api/reports/task-analytics`

**Query Parameters:**
- `family_id` (required): Family ID
- `category` (optional): Filter by task category
- `date_preset` (optional): Date range preset
- `start_date` (optional): Custom start date
- `end_date` (optional): Custom end date

**Response:**

```json
{
  "success": true,
  "message": "Task analytics report generated successfully",
  "data": {
    "report_type": "Task Analytics Report",
    "generated_at": "2026-01-17T10:30:00.000Z",
    "report_period": {
      "start_date": "2025-01-01",
      "end_date": "2026-01-17",
      "category": "All Categories"
    },
    "overview": {
      "total_tasks_created": 50,
      "total_assignments": 150,
      "completed_assignments": 120,
      "overall_completion_rate": "80.00%",
      "total_points_awarded": 2400,
      "avg_points_per_task": 20.00,
      "avg_completion_time": "36.5 hours"
    },
    "priority_breakdown": {
      "low": 10,
      "medium": 25,
      "high": 12,
      "urgent": 3
    },
    "category_performance": [...],
    "top_performing_tasks": [...],
    "status_distribution": [...]
  }
}
```

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/reports/task-analytics?family_id=1&category=Homework&date_preset=this_month" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Reward Analytics Report

Generate analytics for reward redemptions.

**Endpoint:** `GET /api/reports/reward-analytics`

**Query Parameters:**
- `family_id` (required): Family ID
- `date_preset` (optional): Date range preset
- `start_date` (optional): Custom start date
- `end_date` (optional): Custom end date

**Response:**

```json
{
  "success": true,
  "message": "Reward analytics report generated successfully",
  "data": {
    "report_type": "Reward Analytics Report",
    "generated_at": "2026-01-17T10:30:00.000Z",
    "overview": {
      "total_rewards_available": 15,
      "redemption_requests": 45,
      "approved_redemptions": 38,
      "denied_redemptions": 5,
      "pending_redemptions": 2,
      "approval_rate": "84.44%",
      "total_points_spent": 1200,
      "avg_points_per_redemption": 31.58
    },
    "popular_rewards": [...],
    "child_statistics": [...],
    "reward_status_breakdown": [...]
  }
}
```

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/reports/reward-analytics?family_id=1&date_preset=last_90_days" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Family Summary Report

Generate a comprehensive family activity summary.

**Endpoint:** `GET /api/reports/family-summary`

**Query Parameters:**
- `family_id` (required): Family ID
- `date_preset` (optional): Date range preset
- `start_date` (optional): Custom start date
- `end_date` (optional): Custom end date

**Response:**

```json
{
  "success": true,
  "message": "Family summary report generated successfully",
  "data": {
    "report_type": "Family Activity Summary Report",
    "generated_at": "2026-01-17T10:30:00.000Z",
    "family_information": {
      "family_name": "The Doe Family",
      "family_code": "DOE2026",
      "total_members": 4,
      "parents_count": 2,
      "spouses_count": 0,
      "children_count": 2,
      "total_family_points": 300,
      "days_since_creation": 45
    },
    "activity_overview": {
      "tasks_created": 50,
      "assignments": 150,
      "completed_tasks": 120,
      "rewards_available": 15,
      "redemption_requests": 45,
      "points_earned": 2400,
      "points_spent": 1200
    },
    "top_performers": [...],
    "recent_activities": [...],
    "weekly_trend": [...]
  }
}
```

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/reports/family-summary?family_id=1&date_preset=all_time" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. Parent Activity Report

Generate activity report for a parent or spouse.

**Endpoint:** `GET /api/reports/parent-activity`

**Query Parameters:**
- `parent_id` (required): Parent user ID
- `family_id` (required): Family ID
- `date_preset` (optional): Date range preset
- `start_date` (optional): Custom start date
- `end_date` (optional): Custom end date

**Response:**

```json
{
  "success": true,
  "message": "Parent activity report generated successfully",
  "data": {
    "report_type": "Parent Activity Report",
    "generated_at": "2026-01-17T10:30:00.000Z",
    "parent_info": {
      "name": "Jane Doe",
      "role": "parent"
    },
    "task_management": {
      "tasks_created": 50,
      "tasks_assigned": 150,
      "tasks_reviewed": 120,
      "tasks_approved": 108,
      "tasks_rejected": 12,
      "approval_rate": "90.00%",
      "avg_review_time": "4.5 hours"
    },
    "reward_management": {
      "rewards_created": 15,
      "redemptions_reviewed": 38,
      "redemptions_approved": 35
    },
    "recent_actions": [...],
    "tasks_by_category": [...]
  }
}
```

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/reports/parent-activity?parent_id=2&family_id=1&date_preset=this_month" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. Bulk Report Generation

Generate multiple reports in a single request.

**Endpoint:** `POST /api/reports/bulk-generate`

**Request Body:**

```json
{
  "family_id": 1,
  "child_id": 3,
  "parent_id": 2,
  "report_types": [
    "child_performance",
    "task_analytics",
    "family_summary"
  ],
  "date_preset": "this_month"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Bulk reports generated successfully",
  "data": {
    "total_requested": 3,
    "total_generated": 3,
    "reports": [
      {
        "report_type": "child_performance",
        "success": true,
        "data": {...}
      },
      {
        "report_type": "task_analytics",
        "success": true,
        "data": {...}
      },
      {
        "report_type": "family_summary",
        "success": true,
        "data": {...}
      }
    ]
  }
}
```

---

## Analytics Endpoints

### 1. Calculate Performance Score

Calculate multi-factor performance score for a child.

**Endpoint:** `GET /api/analytics/performance-score`

**Query Parameters:**
- `child_id` (required): Child user ID
- `family_id` (required): Family ID
- `date_preset` (optional): Date range preset

**Response:**

```json
{
  "success": true,
  "data": {
    "overall_score": 82.35,
    "rating": "Very Good",
    "breakdown": {
      "completion": {
        "score": 85.00,
        "weight": "35%",
        "description": "Task completion rate"
      },
      "punctuality": {
        "score": 80.00,
        "weight": "25%",
        "description": "On-time completion rate"
      },
      "quality": {
        "score": 87.50,
        "weight": "25%",
        "description": "First-time approval rate"
      },
      "consistency": {
        "score": 70.00,
        "weight": "15%",
        "description": "Regular participation"
      }
    }
  }
}
```

---

### 2. Calculate Family Engagement

Calculate family engagement score.

**Endpoint:** `GET /api/analytics/family-engagement`

**Query Parameters:**
- `family_id` (required): Family ID
- `date_preset` (optional): Date range preset

**Response:**

```json
{
  "success": true,
  "data": {
    "engagement_score": 75.50,
    "engagement_level": "Engaged",
    "breakdown": {
      "task_activity": 78.00,
      "child_participation": 80.00,
      "parent_involvement": 72.00,
      "reward_activity": 70.00
    },
    "recommendations": [
      "Consider creating more engaging tasks",
      "Encourage all children to participate regularly"
    ]
  }
}
```

---

### 3. Analyze Performance Trend

Analyze performance trends over time.

**Endpoint:** `GET /api/analytics/performance-trend`

**Query Parameters:**
- `child_id` (required): Child user ID
- `family_id` (required): Family ID
- `period` (optional): `monthly` or `weekly` (default: `monthly`)

**Response:**

```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "trend_direction": "Improving",
    "rate_of_change": 12.50,
    "prediction": {
      "predicted_completion_rate": 87.50,
      "confidence": "Medium"
    },
    "historical_data": [...],
    "insights": [
      "Performance is showing positive improvement",
      "Significant performance change detected"
    ]
  }
}
```

---

## Export Endpoints

### 1. Export to CSV

Export any report to CSV format.

**Endpoints:**
- `POST /api/export/csv/child-performance`
- `POST /api/export/csv/task-analytics`
- `POST /api/export/csv/reward-analytics`
- `POST /api/export/csv/family-summary`

**Request Body:**

```json
{
  "family_id": 1,
  "child_id": 3,
  "filename": "child_performance_jan2026.csv",
  "date_preset": "this_month"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Report exported to CSV successfully",
  "data": {
    "file_path": "/path/to/exports/child_performance_jan2026.csv",
    "filename": "child_performance_jan2026.csv",
    "format": "CSV"
  }
}
```

---

### 2. Export to PDF

Export reports to PDF format.

**Endpoints:**
- `POST /api/export/pdf/child-performance`
- `POST /api/export/pdf/task-analytics`
- `POST /api/export/pdf/family-summary`

**Request Body:**

```json
{
  "family_id": 1,
  "child_id": 3,
  "filename": "child_performance_jan2026.pdf",
  "date_preset": "this_month"
}
```

---

### 3. Download Exported File

Download a previously exported file.

**Endpoint:** `GET /api/export/download/:filename`

**Example:**

```bash
curl -X GET "http://localhost:5000/api/export/download/child_performance_jan2026.csv" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     --output report.csv
```

---

### 4. List Exported Files

Get a list of all exported files.

**Endpoint:** `GET /api/export/files`

**Response:**

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "filename": "child_performance_jan2026.csv",
        "size": 15234,
        "created": "2026-01-17T10:00:00.000Z",
        "path": "/path/to/exports/child_performance_jan2026.csv"
      }
    ]
  }
}
```

---

### 5. Delete Exported File

Delete an exported file.

**Endpoint:** `DELETE /api/export/files/:filename`

---

### 6. Cleanup Old Files

Automatically delete files older than 24 hours.

**Endpoint:** `POST /api/export/cleanup`

**Response:**

```json
{
  "success": true,
  "message": "Cleaned up 5 old export file(s)"
}
```

---

## Chart Data Endpoints

Get formatted data for charts and visualizations.

### Monthly Trend Chart

**Endpoint:** `GET /api/analytics/charts/monthly-trend`

**Query Parameters:**
- `child_id` (required)
- `family_id` (required)
- `months` (optional): Number of months (1-24, default: 6)

**Response:**

```json
{
  "success": true,
  "data": {
    "labels": ["Jan 2026", "Dec 2025", "Nov 2025"],
    "datasets": [
      {
        "label": "Tasks Assigned",
        "data": [10, 12, 8],
        "borderColor": "rgba(54, 162, 235, 1)",
        "backgroundColor": "rgba(54, 162, 235, 0.1)"
      },
      {
        "label": "Tasks Completed",
        "data": [8, 10, 7],
        "borderColor": "rgba(75, 192, 192, 1)",
        "backgroundColor": "rgba(75, 192, 192, 0.1)"
      }
    ]
  }
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

### Common Errors

**Missing Required Parameter:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "child_id",
      "message": "child_id is required"
    }
  ]
}
```

**Invalid Date Range:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "end_date",
      "message": "end_date must be after start_date"
    }
  ]
}
```

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per user
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

---

## Examples

### Complete Workflow Example

```javascript
// 1. Generate child performance report
const performanceReport = await fetch(
  'http://localhost:5000/api/reports/child-performance?child_id=1&family_id=1&date_preset=this_month',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// 2. Calculate performance score
const performanceScore = await fetch(
  'http://localhost:5000/api/analytics/performance-score?child_id=1&family_id=1',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// 3. Export to PDF
const exportResponse = await fetch(
  'http://localhost:5000/api/export/pdf/child-performance',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      family_id: 1,
      child_id: 1,
      filename: 'report_jan2026.pdf',
      date_preset: 'this_month'
    })
  }
);

// 4. Download the file
const file = await fetch(
  `http://localhost:5000/api/export/download/${exportResponse.data.filename}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

---

## Support

For questions or issues:
- **Student:** Souleymane Camara
- **ID:** BIT1007326
- **Institution:** Regional Maritime University

---

**Last Updated:** January 17, 2026
