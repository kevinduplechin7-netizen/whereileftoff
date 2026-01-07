import { ParsedPointer } from '../types'

export interface ParseResult {
  title: string
  pointer: string
  next_step: string
  parsedPointer?: ParsedPointer
}

/**
 * Parse natural language input into structured marker fields.
 * Examples:
 * - "Bible John 3:16 next: discuss love"
 * - "Mere Christianity page 94 next: underline quote"
 * - "React course step 5 next: build component"
 */
export function parseMarkerInput(input: string): ParseResult {
  const trimmed = input.trim()
  
  // Extract next_step if present
  const nextStepMatch = trimmed.match(/(?:next:|then:|todo:|reminder:)\s*(.+)$/i)
  const nextStep = nextStepMatch ? nextStepMatch[1].trim() : ''
  const beforeNextStep = nextStepMatch ? trimmed.slice(0, nextStepMatch.index).trim() : trimmed
  
  // Try to extract pointer
  const pointerResult = extractPointer(beforeNextStep)
  
  if (pointerResult) {
    return {
      title: pointerResult.title,
      pointer: pointerResult.pointer,
      next_step: nextStep,
      parsedPointer: pointerResult.parsed,
    }
  }
  
  // No pointer found, treat entire input as title
  return {
    title: beforeNextStep,
    pointer: '',
    next_step: nextStep,
  }
}

interface PointerExtractionResult {
  title: string
  pointer: string
  parsed: ParsedPointer
}

function extractPointer(text: string): PointerExtractionResult | null {
  // Try page pointer first
  const pageMatch = text.match(/(.+?)\s+(?:page|pg|p\.?)\s*(\d+)/i)
  if (pageMatch) {
    return {
      title: pageMatch[1].trim(),
      pointer: `page ${pageMatch[2]}`,
      parsed: {
        raw: `page ${pageMatch[2]}`,
        type: 'page',
        page: parseInt(pageMatch[2]),
      },
    }
  }
  
  // Try chapter and verse (Bible format)
  const chapterVerseMatch = text.match(/(.+?)\s+(?:chapter|ch\.?)\s*(\d+)\s*(?:verse|v\.?)\s*(\d+)/i)
  if (chapterVerseMatch) {
    return {
      title: chapterVerseMatch[1].trim(),
      pointer: `chapter ${chapterVerseMatch[2]} verse ${chapterVerseMatch[3]}`,
      parsed: {
        raw: `chapter ${chapterVerseMatch[2]} verse ${chapterVerseMatch[3]}`,
        type: 'chapter_verse',
        chapter: parseInt(chapterVerseMatch[2]),
        verse: parseInt(chapterVerseMatch[3]),
      },
    }
  }
  
  // Try chapter only
  const chapterMatch = text.match(/(.+?)\s+(?:chapter|ch\.?)\s*(\d+)/i)
  if (chapterMatch) {
    return {
      title: chapterMatch[1].trim(),
      pointer: `chapter ${chapterMatch[2]}`,
      parsed: {
        raw: `chapter ${chapterMatch[2]}`,
        type: 'chapter',
        chapter: parseInt(chapterMatch[2]),
      },
    }
  }
  
  // Try verse only
  const verseMatch = text.match(/(.+?)\s+(?:verse|v\.?)\s*(\d+)/i)
  if (verseMatch) {
    return {
      title: verseMatch[1].trim(),
      pointer: `verse ${verseMatch[2]}`,
      parsed: {
        raw: `verse ${verseMatch[2]}`,
        type: 'verse',
        verse: parseInt(verseMatch[2]),
      },
    }
  }
  
  // Try timestamp (mm:ss or hh:mm:ss)
  const timestampMatch = text.match(/(.+?)\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/)
  if (timestampMatch) {
    const hasHours = timestampMatch[4] !== undefined
    const timestamp = hasHours
      ? {
          hours: parseInt(timestampMatch[2]),
          minutes: parseInt(timestampMatch[3]),
          seconds: parseInt(timestampMatch[4]),
        }
      : {
          minutes: parseInt(timestampMatch[2]),
          seconds: parseInt(timestampMatch[3]),
        }
    
    const pointerStr = hasHours
      ? `${timestampMatch[2]}:${timestampMatch[3]}:${timestampMatch[4]}`
      : `${timestampMatch[2]}:${timestampMatch[3]}`
    
    return {
      title: timestampMatch[1].trim(),
      pointer: pointerStr,
      parsed: {
        raw: pointerStr,
        type: 'timestamp',
        timestamp,
      },
    }
  }
  
  // Try step/part/stage
  const stepMatch = text.match(/(.+?)\s+(?:step|part|stage)\s*(\d+)/i)
  if (stepMatch) {
    return {
      title: stepMatch[1].trim(),
      pointer: `step ${stepMatch[2]}`,
      parsed: {
        raw: `step ${stepMatch[2]}`,
        type: 'step',
        step: parseInt(stepMatch[2]),
      },
    }
  }
  
  return null
}

/**
 * Parse pointer string into structured format for quick advance.
 */
export function parsePointerString(pointer: string): ParsedPointer {
  const trimmed = pointer.trim().toLowerCase()
  
  // Page
  const pageMatch = trimmed.match(/(?:page|pg|p\.?)\s*(\d+)/)
  if (pageMatch) {
    return {
      raw: pointer,
      type: 'page',
      page: parseInt(pageMatch[1]),
    }
  }
  
  // Chapter and verse
  const chapterVerseMatch = trimmed.match(/(?:chapter|ch\.?)\s*(\d+)\s*(?:verse|v\.?)\s*(\d+)/)
  if (chapterVerseMatch) {
    return {
      raw: pointer,
      type: 'chapter_verse',
      chapter: parseInt(chapterVerseMatch[1]),
      verse: parseInt(chapterVerseMatch[2]),
    }
  }
  
  // Chapter only
  const chapterMatch = trimmed.match(/(?:chapter|ch\.?)\s*(\d+)/)
  if (chapterMatch) {
    return {
      raw: pointer,
      type: 'chapter',
      chapter: parseInt(chapterMatch[1]),
    }
  }
  
  // Verse only
  const verseMatch = trimmed.match(/(?:verse|v\.?)\s*(\d+)/)
  if (verseMatch) {
    return {
      raw: pointer,
      type: 'verse',
      verse: parseInt(verseMatch[1]),
    }
  }
  
  // Timestamp
  const timestampMatch = trimmed.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
  if (timestampMatch) {
    const hasHours = timestampMatch[3] !== undefined
    return {
      raw: pointer,
      type: 'timestamp',
      timestamp: hasHours
        ? {
            hours: parseInt(timestampMatch[1]),
            minutes: parseInt(timestampMatch[2]),
            seconds: parseInt(timestampMatch[3]),
          }
        : {
            minutes: parseInt(timestampMatch[1]),
            seconds: parseInt(timestampMatch[2]),
          },
    }
  }
  
  // Step
  const stepMatch = trimmed.match(/(?:step|part|stage)\s*(\d+)/)
  if (stepMatch) {
    return {
      raw: pointer,
      type: 'step',
      step: parseInt(stepMatch[1]),
    }
  }
  
  return { raw: pointer }
}

/**
 * Advance pointer by one unit (page, chapter, verse, etc.)
 */
export function advancePointer(pointer: string, amount: number = 1): string | null {
  const parsed = parsePointerString(pointer)
  
  switch (parsed.type) {
    case 'page':
      return `page ${parsed.page! + amount}`
    
    case 'chapter':
      return `chapter ${parsed.chapter! + amount}`
    
    case 'verse':
      return `verse ${parsed.verse! + amount}`
    
    case 'chapter_verse':
      return `chapter ${parsed.chapter} verse ${parsed.verse! + amount}`
    
    case 'step':
      return `step ${parsed.step! + amount}`
    
    case 'timestamp':
      return advanceTimestamp(parsed.timestamp!, amount)
    
    default:
      return null
  }
}

function advanceTimestamp(ts: { hours?: number; minutes: number; seconds: number }, seconds: number): string {
  let totalSeconds = (ts.hours || 0) * 3600 + ts.minutes * 60 + ts.seconds + seconds
  
  const hours = Math.floor(totalSeconds / 3600)
  totalSeconds %= 3600
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
