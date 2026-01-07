# Where I Left Off

A tiny, trustworthy "resume drawer" for busy people who constantly pause and resume books, projects, courses, videos, and routines.

## What It Does

- **Markers**: Remember where you left off in anything (books, Bible study, articles, DIY projects)
- **Rhythms**: Simple repeating reminders (trash day, pickup routines, regular habits)
- **Smart Parsing**: Type naturally ("Bible John 3:16 next: discuss love") and it figures out the structure
- **Quick Advance**: One-tap buttons to move forward (next page, next chapter, next verse)
- **Offline-First**: Works without internet, stores everything locally
- **Safe by Default**: Undo, archive (never delete), auto-save drafts, safe imports

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

The app will open with sample data pre-loaded so you can immediately see how it works.

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

The built app will be in the `dist/` directory and can be deployed to any static hosting (Netlify, Vercel, GitHub Pages, etc.).

### Deploy to Static Hosting

**Netlify/Vercel:**
1. Connect your repo
2. Build command: `npm run build`
3. Publish directory: `dist`

**GitHub Pages:**
```bash
npm run build
# Push the dist/ folder to gh-pages branch
```

## Architecture

### Tech Stack
- **React 18** with TypeScript
- **Vite** for fast builds and dev server
- **IndexedDB** (via idb library) for local storage
- **Workbox** for service worker / PWA support
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Key Design Decisions

1. **Two Object Model**: Only Markers and Rhythms. No scope creep into notes/tasks/calendar.
2. **Smart Parsing**: Forgiving natural language input, but always preserves raw user input.
3. **Undo Stack**: Every destructive action can be undone within 5 seconds.
4. **Archive, Not Delete**: Nothing is ever truly lost. Archive screen allows restore.
5. **Auto-Save Drafts**: Forms save to sessionStorage every 2s to prevent data loss.
6. **Offline-First**: All data stored locally. Export/Import for backup/transfer.
7. **Progressive Web App**: Installable, works offline, fast load times.

### File Structure

```
where-i-left-off/
├── public/
│   └── icons/          # PWA icons
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Core logic (db, parser, scheduler)
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Test Plan

### Basic Flows to Verify

1. **Add Marker (Quick Capture)**
   - Tap "+" button
   - Type: "Bible John 3:16 next: discuss love"
   - Tap "Save"
   - ✓ Marker appears with parsed fields (title, pointer, next_step)
   - ✓ Snackbar confirms save

2. **Advance Pointer**
   - Open a book Marker (e.g., "Mere Christianity, page 94")
   - Tap "+1 page"
   - ✓ Pointer updates to "page 95"
   - ✓ Undo snackbar appears
   - ✓ Marker moves to top of list

3. **Add Rhythm**
   - Tap "+" → switch to "Rhythm" tab
   - Enter title: "Trash day"
   - Select schedule: Weekly → Thursdays
   - Tap "Save"
   - ✓ Rhythm appears in home if due today, or in Search

4. **Mark Rhythm Done**
   - Find rhythm in "Today's Rhythms"
   - Tap "Mark Done"
   - ✓ Next occurrence updates
   - ✓ Undo appears

5. **Archive & Restore**
   - Open any Marker
   - Tap "Archive"
   - ✓ Undo snackbar appears
   - Go to Archive screen
   - ✓ Item appears
   - Tap "Restore"
   - ✓ Item returns to home

6. **Export & Import**
   - Settings → "Export Data"
   - ✓ JSON file downloads
   - Add a new Marker
   - Settings → "Import Data" → select downloaded JSON
   - ✓ Preview shows merge summary
   - Tap "Import"
   - ✓ Data merges safely (no duplicates)

7. **Search & Filter**
   - Add markers with different types/tags
   - Use search bar
   - ✓ Full-text search works (title, pointer, next_step)
   - Tap filter chips
   - ✓ Results filter correctly

8. **Undo Actions**
   - Perform any action (archive, advance, mark done)
   - ✓ Undo snackbar appears for 5 seconds
   - Tap "Undo"
   - ✓ Action reverses correctly

9. **Auto-Save Draft**
   - Start creating a Marker
   - Type some text
   - Navigate away (browser back)
   - Return to Add screen
   - ✓ Draft is restored

10. **Offline Functionality**
    - Disconnect internet
    - ✓ App still works
    - Add/edit markers
    - ✓ All changes persist
    - Reconnect
    - ✓ No data loss

## Future Enhancements (Optional)

### SHOULD (Nice, Still Simple)
- **Voice Input**: Speak your marker instead of typing
- **Dark Mode**: System-aware theme switching
- **Bulk Operations**: Archive multiple items at once
- **Keyboard Shortcuts**: Power user efficiency (J/K navigation, etc.)
- **Stats Dashboard**: Simple charts (books completed, streaks)

### LATER (Would Be Great, But Risks Scope Creep)
- **Cloud Sync**: Optional account-based sync across devices (risk: complexity, privacy, auth)
- **Shared Groups**: Collaborative markers for book clubs (risk: becomes a social app)
- **Rich Text Notes**: Formatting, images (risk: becomes a notes app)
- **Calendar View**: Visual timeline (risk: becomes a calendar app)
- **Integrations**: Goodreads, Bible APIs (risk: API dependencies, maintenance)

## Accessibility

- Large tap targets (min 44x44px)
- High contrast (WCAG AA compliant)
- Keyboard navigation support
- Screen reader friendly (semantic HTML, ARIA labels)
- Focus indicators visible
- Form validation errors announced

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## License

MIT

## Questions?

This is a self-contained, local-first app. No telemetry, no accounts, no cloud. Your data stays on your device. Export regularly to back up.
