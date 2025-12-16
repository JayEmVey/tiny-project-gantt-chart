# tiny-project-gantt-chart

A tiny, fast, and interactive Gantt chart for project timelines. Built with React, TypeScript, Tailwind, and Vite.

## ✨ What's inside (current)

- Modern, responsive UI/UX with hierarchical task organization
- **Drag and Drop:** Reorder Epics, User Stories, and Tasks in the sidebar
- Interactive Gantt bars: drag to move, resize from edges
- Epic/User Story/Task hierarchy with visual indicators
- Modal editing with date pickers (DD/MM/YYYY)
- Project save/load functionality (.json format)
- PNG and PDF export with customizable views
- Multiple zoom levels (Day, Week, Month, Quarter)
- Milestone support with visual markers
- Critical path visualization
- Keyboard shortcuts (Ctrl+S to save, Ctrl+/- to zoom)
- Lightweight and responsive

## Preview

Run locally and open the app to see the pink theme with months/quarters, draggable gantt bars, and an Edit Data table view.

## Getting Started

### Prerequisites

- Node.js 18+
- npm (comes with Node)

### Install & run

1) Clone and install
```bash
git clone https://github.com/JayEmVey/tiny-project-gantt-chart.git
cd tiny-project-gantt-chart
npm install
```

2) Start dev server
```bash
npm run dev
```

The dev server prints a URL like http://localhost:5173 or http://localhost:5174.

## Scripts

### Development
- `npm run dev` – start Vite dev server
- `npm run build` – build the production bundle to `dist/`
- `npm run preview` – serve the production build locally
- `npm run lint` – run ESLint

### Testing
- `npm test` – run all automated tests
- `npm run test:ui` – run tests in interactive UI mode
- `npm run test:headed` – run tests in headed browser mode
- `npm run test:chromium` – run tests only in Chromium
- `npm run test:firefox` – run tests only in Firefox
- `npm run test:webkit` – run tests only in WebKit (Safari)
- `npm run test:functional` – run functional tests only
- `npm run test:ux` – run UX tests only
- `npm run test:performance` – run performance tests only
- `npm run test:accessibility` – run accessibility tests only
- `npm run test:report` – view the last test report

## Testing

This project includes comprehensive automated testing using Playwright to ensure functionality and user experience quality.

**📚 Quick Links:**
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Comprehensive testing guide
- [TEST_SUMMARY.md](TEST_SUMMARY.md) - Quick overview of what was added

### Automated Testing (Recommended)

We use [Playwright](https://playwright.dev/) for end-to-end testing, which tests the application as a real user would interact with it.

#### Quick Start

Run all tests:
```bash
npm test
```

Run tests in interactive UI mode (recommended for development):
```bash
npm run test:ui
```

Run tests in headed mode (see the browser):
```bash
npm run test:headed
```

#### Test Suites

Our automated tests cover four key areas:

**1. Functional Tests** ([tests/functional.spec.ts](tests/functional.spec.ts))
- Creating Epics, User Stories, and Tasks
- Saving and loading projects
- Toggling between views
- Zoom and navigation controls
- Export functionality (PNG/PDF)
- Keyboard shortcuts

Run with:
```bash
npm run test:functional
```

**2. UX Tests** ([tests/ux.spec.ts](tests/ux.spec.ts))
- Responsive design (mobile, tablet, desktop)
- Drag and drop interactions
- Tooltips and user feedback
- Mouse and keyboard interactions
- Visual hierarchy and consistency
- Error handling

Run with:
```bash
npm run test:ux
```

**3. Performance Tests** ([tests/performance.spec.ts](tests/performance.spec.ts))
- Page load time
- Render performance
- Smooth scrolling
- Zoom operation efficiency
- Handling multiple tasks
- Bundle size optimization

Run with:
```bash
npm run test:performance
```

**4. Accessibility Tests** ([tests/accessibility.spec.ts](tests/accessibility.spec.ts))
- Keyboard navigation
- Screen reader support
- Focus indicators
- Color contrast
- Semantic HTML
- ARIA roles and labels

Run with:
```bash
npm run test:accessibility
```

#### Browser-Specific Testing

Test on specific browsers:
```bash
npm run test:chromium   # Chrome/Edge
npm run test:firefox    # Firefox
npm run test:webkit     # Safari
```

#### View Test Reports

After running tests, view the HTML report:
```bash
npm run test:report
```

### Running Tests from Terminal

The simplest way to run tests:

1. **Run all tests** (Playwright will automatically start the dev server):
   ```bash
   npm test
   ```

2. **Run tests in UI mode** (best for debugging):
   ```bash
   npm run test:ui
   ```

3. **View the results**:
   - Tests will output results in the terminal
   - HTML report is generated in `playwright-report/`
   - Screenshots and videos are saved on failure in `test-results/`

### Continuous Integration

Tests are configured to run automatically in CI environments. The test suite will:
- Run in headless mode
- Retry failed tests up to 2 times
- Generate HTML and JSON reports
- Capture screenshots and videos on failure

### Manual UI/UX Testing

For manual testing, see:
- **Quick Start:** [TESTING_QUICK_START.md](TESTING_QUICK_START.md) for a 5-minute smoke test
- **Full Test Suite:** [TEST_CASES.md](TEST_CASES.md) for detailed manual test scenarios

### Quick Smoke Test (Manual)

To quickly verify the application is working manually:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run build to check for TypeScript errors
npm run build
```

Then in the browser:
1. ✅ Create an Epic, User Story, and Task
2. ✅ Drag and drop items to reorder them
3. ✅ Drag a task bar in the Gantt chart
4. ✅ Save the project (Ctrl+S)
5. ✅ Export as PNG
6. ✅ Reload and load the saved project

All core features should work without errors.

## Project Structure (key files)

```
src/
  components/
    GanttChart.css                        # Additional Gantt styles
    GanttChartGenerator/
      GanttChartGenerator.tsx             # Main feature component
      ChartView.tsx, EditTable.tsx, ...   # Supporting UI pieces
  constants/
    calendar.ts                           # Months/quarters
  hooks/
    useGanttTasks.ts                      # (legacy) tasks hook
  utils/
    ganttUtils.ts                         # CSV utilities (legacy)
  App.tsx                                 # Mounts GanttChartGenerator
  types.ts                                # Types used in the app
```

## Current Task shape

The refactor uses simple string dates in day-first format:

```ts
export interface Task {
  id: number
  process: string
  startDate: string // DD/MM/YYYY
  endDate: string   // DD/MM/YYYY
}
```

## Using the app

### Sidebar (Task List)
- **Add Items:** Click the "+" button to create new Epics, User Stories, or Tasks
- **Expand/Collapse:** Click the chevron icon next to items to show/hide children
- **Drag and Drop:** Click and drag any Epic, User Story, or Task to reorder them
  - Epics can be reordered freely
  - User Stories can be reordered within the same Epic
  - Tasks can be reordered within the same User Story
- **Select/Deselect:** Check/uncheck items to show/hide them in the Gantt chart
- **Edit:** Double-click any item to open the edit modal
- **Clone/Delete:** Select items and use the clone/delete buttons in the header

### Gantt Chart View
- **Drag Task Bars:** Click and drag task bars to change dates
- **Resize Bars:** Drag the left or right edge to change start/end dates
- **Click Bar:** Click a task bar to open the edit modal
- **Click Empty Cell:** Click an empty area to create a new task at that date
- **Zoom:** Use Day/Week/Month/Quarter buttons to change timeline scale
- **Navigate:** Use arrow buttons or "Today" button to navigate the timeline
- **Critical Path:** Enable the "Critical Path" toggle to visualize task dependencies
  - Red arrows show critical dependencies (tasks that directly impact project completion)
  - Gray arrows show non-critical dependencies
  - Critical path helps identify tasks that cannot be delayed without affecting the project timeline

### Project Management
- **Save Project:** Press Ctrl+S (Cmd+S on Mac) or use File → Save Project
- **Open Project:** Use File → Open Project to load a .json project file
- **New Project:** Use File → New Project to start fresh
- **Export:** Click Export to download as PNG or PDF

### Keyboard Shortcuts
- `Ctrl+S` / `Cmd+S` – Save project
- `Ctrl++` / `Cmd++` – Zoom in
- `Ctrl+-` / `Cmd+-` – Zoom out
- `Ctrl+0` / `Cmd+0` – Reset zoom

### CSV format

CSV has a header row plus rows with three fields:

```
Process,Start Date,End Date
"Planning",01/01/2025,28/02/2025
"Wireframing",01/03/2025,15/04/2025
```

- Process may be quoted if it contains commas
- Date format must be `DD/MM/YYYY`

## Build

Generate a production build in `dist/`:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Production deployment

This is a static site. After `npm run build`, deploy the `dist/` folder to any static host.

### Option A: Netlify

- Build command: `npm run build`
- Publish directory: `dist`

Drag-and-drop the `dist/` folder to Netlify, or connect your repo with the above settings.

### Option B: Vercel

- Framework preset: “Other”
- Build command: `npm run build`
- Output directory: `dist`

### Option C: GitHub Pages (via Actions)

1) Ensure your repository is on GitHub
2) Ensure Vite base matches your repo name (already set to `/tiny-project-gantt-chart/` in `vite.config.ts`; change it if your repo name differs)
3) Add the GitHub Actions workflow below at `.github/workflows/deploy.yml`
4) Commit and push to `main` — the workflow will build and publish your `dist/` to the GitHub Pages environment
5) In GitHub → Settings → Pages, set "Build and deployment" to "GitHub Actions" (if not already)

Note: The workflow below uses the newer "Pages environment" deployment (no `gh-pages` branch is created). If you specifically want to publish to a `gh-pages` branch, see the alternative snippet further below.

Example workflow (place at `.github/workflows/deploy.yml`):

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Enable GitHub Pages in your repo settings, “Build and deployment” → “GitHub Actions”.

Alternative (publish to a `gh-pages` branch):

If you prefer a `gh-pages` branch-based deployment, use `peaceiris/actions-gh-pages`. Remove the previous workflow and use this instead:

```yaml
name: Deploy to gh-pages branch
on:
  push:
    branches: [ main ]
permissions:
  contents: write
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: gh-pages
```

Then set Pages source to the `gh-pages` branch in repo Settings → Pages.

### Option D: Docker + Nginx

Build a tiny container that serves the static files with Nginx. Create a `Dockerfile` (example):

```Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Then build and run:

```bash
docker build -t tiny-gantt:prod .
docker run -p 8080:80 tiny-gantt:prod
```

Open http://localhost:8080

## Troubleshooting

- Dev server says “Port 5173 in use”: it will pick another port (e.g., 5174). Use the printed URL.
- Blank UI or missing bars:
  - Ensure you’re on the Chart view (toggle at top-left)
  - Dates must be `DD/MM/YYYY`
  - Try resizing the window; the chart is responsive
- CSV import not working: check header names and date formats

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- lucide-react (icons)

## License

MIT

## Contributing

Issues and PRs welcome!
