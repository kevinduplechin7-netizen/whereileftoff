import { Marker, Rhythm } from '../types'
import { calculateNextOccurrence } from './scheduler'

export const sampleMarkers: Marker[] = [
  {
    id: 'marker-1',
    title: 'Mere Christianity',
    pointer: 'page 47',
    next_step: 'Finish Chapter 3 on pride',
    type: 'book',
    tags: ['theology', 'C.S. Lewis'],
    pinned: true,
    archived: false,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_touched: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'marker-2',
    title: 'Tuesday Bible Study - Gospel of John',
    pointer: 'chapter 3 verse 16',
    next_step: 'Discuss love and sacrifice',
    type: 'bible',
    tags: ['bible-study'],
    group: 'Tuesday group',
    meeting_note: 'Bob will bring snacks',
    pinned: false,
    archived: false,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    last_touched: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'marker-3',
    title: 'Kitchen Remodel',
    pointer: 'step 5',
    next_step: 'Install cabinet hardware',
    type: 'project',
    tags: ['home', 'DIY'],
    pinned: false,
    archived: false,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    last_touched: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'marker-4',
    title: 'React Advanced Patterns Course',
    pointer: 'chapter 4',
    next_step: 'Watch video on compound components',
    type: 'course',
    tags: ['learning', 'react'],
    pinned: false,
    archived: false,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_touched: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'marker-5',
    title: 'The Huberman Lab Podcast - Sleep Episode',
    pointer: '34:22',
    next_step: 'Take notes on morning sunlight',
    type: 'video',
    tags: ['health', 'podcast'],
    pinned: false,
    archived: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_touched: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const sampleRhythms: Rhythm[] = [
  {
    id: 'rhythm-1',
    title: 'Trash day',
    schedule: {
      type: 'weekly',
      days_of_week: [4], // Thursday
    },
    next_occurrence: calculateNextOccurrence({
      type: 'weekly',
      days_of_week: [4],
    }).toISOString(),
    notification_enabled: false,
    tags: ['home', 'chores'],
    archived: false,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rhythm-2',
    title: 'Water plants',
    schedule: {
      type: 'custom',
      interval_days: 3,
    },
    next_occurrence: calculateNextOccurrence({
      type: 'custom',
      interval_days: 3,
    }).toISOString(),
    notification_enabled: false,
    tags: ['home', 'plants'],
    archived: false,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rhythm-3',
    title: 'Weekly review',
    schedule: {
      type: 'weekly',
      days_of_week: [0], // Sunday
    },
    next_occurrence: calculateNextOccurrence({
      type: 'weekly',
      days_of_week: [0],
    }).toISOString(),
    notification_enabled: false,
    tags: ['personal', 'reflection'],
    archived: false,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
