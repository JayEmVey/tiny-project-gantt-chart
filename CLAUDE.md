# CLAUDE.md - Instructions for AI Assistants

This file provides context and guidelines for Claude (or other AI assistants) working on this project.

---

## Project Overview

**tiny-project-gantt-chart** is a lightweight, interactive Gantt chart application for project timeline management. It's built with React, TypeScript, Tailwind CSS, and Vite.

**Key Features:**
- Hierarchical task organization (Epics → User Stories → Tasks)
- Interactive drag-and-drop for reordering and editing
- Gantt chart with draggable/resizable bars
- Multiple zoom levels (Day, Week, Month, Quarter)
- Project save/load functionality (.json format)
- Export to PNG and PDF
- Milestone support and critical path visualization
- Keyboard shortcuts (Ctrl+S, Ctrl+/-)

---

## Core Architecture

### Tech Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **lucide-react** for icons
- **html2canvas** and **jspdf** for export functionality
- **Playwright** for end-to-end testing

### Key File Structure
```
src/
  components/
    GanttChartGenerator/
      GanttChartGenerator.tsx  # Main orchestrator component
      GanttChartMain.tsx       # Main layout wrapper
      TaskList.tsx             # Left sidebar with task hierarchy
      GanttChartView.tsx       # Right panel with Gantt chart
      ChartView.tsx            # Gantt chart rendering logic
      TaskModal.tsx            # Task edit modal
      EpicModal.tsx            # Epic edit modal
      UserStoryModal.tsx       # User Story edit modal
      MilestoneModal.tsx       # Milestone modal
      ExportModal.tsx          # Export options modal
      Header.tsx               # Top navigation bar
      ViewControls.tsx         # View type and zoom controls
  utils/
    projectFileHandler.ts      # JSON save/load logic
    ganttUtils.ts              # Legacy CSV utilities
    epicDateCalculator.ts      # Epic date range calculations
    assigneeListParser.ts      # Assignee parsing
    criticalPathCalculator.ts  # Critical path analysis (CPM algorithm)
  types.ts                     # TypeScript interfaces
  constants/calendar.ts        # Month/quarter definitions
```

### Data Model
See [src/types.ts](src/types.ts) for complete type definitions.

**Task** (DD/MM/YYYY format):
```typescript
interface Task {
  id: number
  process: string
  startDate: string      // DD/MM/YYYY
  endDate: string        // DD/MM/YYYY
  assignee?: string
  status?: 'not-started' | 'in-progress' | 'completed' | 'overdue'
  priority?: 'low' | 'medium' | 'high'
  progress?: number      // 0-100
  description?: string
  dependencies?: number[]
  dependenciesV2?: TaskDependency[]
  epicId?: number
  userStoryId?: number
}
```

**Epic** and **UserStory** have similar structures without dates (dates are calculated from their children).

---

## Development Workflow

### Running the Project
```bash
npm install           # Install dependencies
npm run dev           # Start dev server (localhost:5173 or 5174)
npm run build         # Production build
npm run preview       # Preview production build
npm run lint          # Run ESLint
```

### Testing
The project has comprehensive Playwright tests covering:
- **Functional tests** ([tests/functional.spec.ts](tests/functional.spec.ts))
- **UX tests** ([tests/ux.spec.ts](tests/ux.spec.ts))
- **Performance tests** ([tests/performance.spec.ts](tests/performance.spec.ts))
- **Accessibility tests** ([tests/accessibility.spec.ts](tests/accessibility.spec.ts))

```bash
npm test              # Run all tests
npm run test:ui       # Interactive UI mode (recommended)
npm run test:headed   # Run in headed browser mode
npm run test:report   # View last test report
```

**Important:** Always run tests after significant changes. Tests will auto-start the dev server.

---

## Common Tasks & Guidelines

### When Making Changes

1. **Read Before Writing:** Always read existing files before editing
2. **Preserve Formatting:** Match existing code style (2-space indentation, React conventions)
3. **Date Format:** All dates are DD/MM/YYYY (day-first format)
4. **Type Safety:** Maintain strict TypeScript typing
5. **Run Tests:** After changes, run `npm test` or at minimum `npm run build` to check for TypeScript errors
6. **Update Documentation:** If adding features, update [README.md](README.md) and relevant docs

### File Reference Format
When referencing code locations, use markdown links:
- Files: `[TaskList.tsx](src/components/GanttChartGenerator/TaskList.tsx)`
- Specific lines: `[TaskList.tsx:142](src/components/GanttChartGenerator/TaskList.tsx#L142)`
- Line ranges: `[TaskList.tsx:142-156](src/components/GanttChartGenerator/TaskList.tsx#L142-L156)`

### Code Style
- **React Components:** Functional components with hooks
- **State Management:** useState and useEffect (no external state library)
- **Event Handlers:** Prefix with `handle` (e.g., `handleTaskClick`)
- **Styling:** Tailwind utility classes, avoid inline styles
- **Imports:** Group imports (React, third-party, local utils, local components, types)

### Common Patterns

**Adding a new modal:**
1. Create modal component in `src/components/GanttChartGenerator/`
2. Use existing modals as templates (TaskModal.tsx, EpicModal.tsx)
3. Add open/close state in parent component
4. Include proper form validation

**Modifying Gantt chart behavior:**
- Chart rendering logic is in [ChartView.tsx](src/components/GanttChartGenerator/ChartView.tsx)
- Drag/drop logic is in [GanttChartView.tsx](src/components/GanttChartGenerator/GanttChartView.tsx)
- Date calculations are in [epicDateCalculator.ts](src/utils/epicDateCalculator.ts)

**Working with critical path:**
- Critical path algorithm (CPM) is in [criticalPathCalculator.ts](src/utils/criticalPathCalculator.ts)
- Dependencies are stored in `task.dependencies` array (array of task IDs)
- Visual rendering uses SVG arrows in [GanttChartView.tsx](src/components/GanttChartGenerator/GanttChartView.tsx)
- Red arrows indicate critical dependencies (tasks on critical path)
- Gray arrows indicate non-critical dependencies
- Algorithm uses forward/backward pass to calculate early/late start/finish times and slack

**Working with dates:**
- Always use DD/MM/YYYY format
- Parse with: `const [day, month, year] = dateStr.split('/').map(Number)`
- Format with: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
- Use JavaScript Date object for calculations, then convert back to string

---

## Known Issues & Constraints

### Current Limitations
- No backend/database (client-side only)
- No real-time collaboration (single-user)
- Export quality depends on browser canvas rendering
- Large projects (500+ tasks) may experience performance degradation

### Dependencies & Package Management
- Uses `overrides` and `resolutions` to replace deprecated packages (see [package.json](package.json))
- `glob` upgraded to v10, `inflight` replaced with `lru-cache`

### Browser Compatibility
- Targets modern browsers (Chrome, Firefox, Safari, Edge)
- Uses ES2020+ features
- Requires JavaScript enabled

---

## Testing Strategy

### Before Committing Code
1. Run TypeScript check: `npm run build`
2. Run linter: `npm run lint`
3. Run tests: `npm test` or `npm run test:functional`
4. Manual smoke test:
   - Create an Epic, User Story, and Task
   - Drag and drop items
   - Drag a task bar in Gantt chart
   - Save project (Ctrl+S)
   - Export as PNG
   - Reload and load saved project

### Writing New Tests
- Add to existing test files or create new spec file in `tests/`
- Follow Playwright conventions
- Include descriptive test names
- Test both happy paths and error cases
- See [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed guidance

---

## Documentation Files

- [README.md](README.md) - User-facing documentation, setup instructions
- [Functional-specification.md](Functional-specification.md) - Product requirements
- [UIUX design patterns.md](UIUX%20design%20patterns.md) - Design guidelines
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Comprehensive testing documentation
- [TEST_CASES.md](TEST_CASES.md) - Manual test scenarios
- [IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md) - Technical implementation details

**When to update docs:**
- New features → Update README.md features list
- UI changes → Consider updating UIUX design patterns.md
- New tests → Update TESTING_GUIDE.md
- Bug fixes → Update IMPLEMENTATION_NOTES.md if architectural

---

## Git Workflow

### Current Branch
Main branch: `main`

### Commit Messages
Follow conventional commits format:
- `feat: add milestone filtering`
- `fix: correct date parsing for February`
- `refactor: simplify task reordering logic`
- `test: add accessibility tests for modals`
- `docs: update README with new export options`

### Before Creating PRs
1. Ensure all tests pass
2. Check for TypeScript errors
3. Verify no console errors in browser
4. Test core user flows manually
5. Update relevant documentation

---

## Tips for Effective Contributions

### Understanding State Flow
1. **GanttChartGenerator.tsx** holds primary state (tasks, epics, userStories, milestones)
2. State is passed down to child components via props
3. Event handlers are defined in GanttChartGenerator and passed down
4. State updates trigger re-renders of affected components

### Debugging Tips
- Use React DevTools to inspect component state
- Check browser console for errors
- Use `console.log` strategically (but remove before committing)
- Playwright UI mode (`npm run test:ui`) is excellent for debugging test failures

### Performance Considerations
- Gantt chart re-renders can be expensive with many tasks
- Consider memoization (React.memo) for heavy components
- Avoid inline function definitions in render (causes re-renders)
- Be mindful of drag handlers on many elements

### Accessibility
- All interactive elements should be keyboard accessible
- Use semantic HTML
- Include ARIA labels where appropriate
- Test with keyboard navigation (Tab, Enter, Space, Arrows)
- Run accessibility tests: `npm run test:accessibility`

---

## Quick Reference

### Date Format
**Always DD/MM/YYYY** (e.g., "25/12/2025" for December 25, 2025)

### Task Hierarchy
Epic → User Story → Task

### File Save Format
JSON file with structure:
```json
{
  "epics": [...],
  "userStories": [...],
  "tasks": [...],
  "milestones": [...]
}
```

### Keyboard Shortcuts
- `Ctrl+S` / `Cmd+S` - Save project
- `Ctrl++` / `Cmd++` - Zoom in
- `Ctrl+-` / `Cmd+-` - Zoom out
- `Ctrl+0` / `Cmd+0` - Reset zoom

---

## Questions or Issues?

- Check [README.md](README.md) for user documentation
- Check [TESTING_GUIDE.md](TESTING_GUIDE.md) for testing help
- Check [IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md) for technical details
- Review recent commits for context on changes
- Run tests to ensure changes don't break existing functionality

---

**Last Updated:** 2025-10-20
