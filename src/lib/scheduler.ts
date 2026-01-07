import { Schedule } from '../types'

/**
 * Calculate next occurrence based on schedule and current date.
 */
export function calculateNextOccurrence(schedule: Schedule, fromDate: Date = new Date()): Date {
  const date = new Date(fromDate)
  
  switch (schedule.type) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      date.setHours(9, 0, 0, 0) // Default to 9 AM
      return date
    
    case 'weekly':
      return calculateNextWeeklyOccurrence(schedule, date)
    
    case 'monthly':
      return calculateNextMonthlyOccurrence(schedule, date)
    
    case 'custom':
      date.setDate(date.getDate() + (schedule.interval_days || 1))
      date.setHours(9, 0, 0, 0)
      return date
    
    default:
      return date
  }
}

function calculateNextWeeklyOccurrence(schedule: Schedule, fromDate: Date): Date {
  if (!schedule.days_of_week || schedule.days_of_week.length === 0) {
    throw new Error('Weekly schedule must have days_of_week')
  }
  
  const date = new Date(fromDate)
  const currentDay = date.getDay()
  
  // Sort days and find next occurrence
  const sortedDays = [...schedule.days_of_week].sort((a, b) => a - b)
  
  // Try to find a day in the current week
  for (const day of sortedDays) {
    if (day > currentDay) {
      const daysToAdd = day - currentDay
      date.setDate(date.getDate() + daysToAdd)
      date.setHours(9, 0, 0, 0)
      return date
    }
  }
  
  // No day found in current week, go to first day of next week
  const firstDay = sortedDays[0]
  const daysToAdd = 7 - currentDay + firstDay
  date.setDate(date.getDate() + daysToAdd)
  date.setHours(9, 0, 0, 0)
  return date
}

function calculateNextMonthlyOccurrence(schedule: Schedule, fromDate: Date): Date {
  if (!schedule.day_of_month) {
    throw new Error('Monthly schedule must have day_of_month')
  }
  
  const date = new Date(fromDate)
  const currentDay = date.getDate()
  
  // If target day hasn't passed this month, use it
  if (schedule.day_of_month > currentDay) {
    date.setDate(schedule.day_of_month)
    date.setHours(9, 0, 0, 0)
    return date
  }
  
  // Otherwise, go to next month
  date.setMonth(date.getMonth() + 1)
  date.setDate(Math.min(schedule.day_of_month, getDaysInMonth(date)))
  date.setHours(9, 0, 0, 0)
  return date
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/**
 * Format schedule as human-readable string.
 */
export function formatSchedule(schedule: Schedule): string {
  switch (schedule.type) {
    case 'daily':
      return 'Every day'
    
    case 'weekly':
      if (!schedule.days_of_week || schedule.days_of_week.length === 0) {
        return 'Weekly'
      }
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const days = schedule.days_of_week.map(d => dayNames[d]).join(', ')
      return `Every ${days}`
    
    case 'monthly':
      if (!schedule.day_of_month) {
        return 'Monthly'
      }
      return `Monthly on day ${schedule.day_of_month}`
    
    case 'custom':
      const interval = schedule.interval_days || 1
      return interval === 1 ? 'Every day' : `Every ${interval} days`
    
    default:
      return 'Unknown schedule'
  }
}

/**
 * Format date relative to now (e.g., "Today", "Tomorrow", "In 3 days")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  const diffMs = targetDate.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
  if (diffDays < 7) return `In ${diffDays} days`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
