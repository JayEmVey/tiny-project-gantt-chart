# tiny-project-gantt-chart

A tiny, fast, and interactive Gantt chart for project timelines. Built with React, TypeScript, Tailwind, and Vite.

## ✨ What's inside (current)

- Pink-themed, modern UI/UX
- Interactive Gantt bars: drag to move, resize from edges
- Modal editing with date pickers (DD/MM/YYYY)
- CSV import/export (simple, human-friendly format)
- Toggle between Chart and Edit views
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

- `npm run dev` – start Vite dev server
- `npm run build` – build the production bundle to `dist/`
- `npm run preview` – serve the production build locally
- `npm run lint` – run ESLint

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

- Edit vs Chart view: use the top-left button to toggle
- In Edit view:
  - Change process name or adjust start/end via date pickers
  - Add rows (Add Process) or delete rows
- In Chart view:
  - Drag a bar to move dates
  - Drag edges to resize
  - Click a bar to open the edit modal
- Import/Export CSV to move data around

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
2) Add a GitHub Actions workflow that builds and publishes `dist/` to `gh-pages`

Example workflow (optional) placed at `.github/workflows/deploy.yml`:

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
