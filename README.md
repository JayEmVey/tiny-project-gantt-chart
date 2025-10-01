# tiny-project-gantt-chart

A lite version of project timeline management using the Gantt chart style. Built with React, TypeScript, and Vite.

## Features

- 📊 Visual Gantt chart timeline
- 📅 Task scheduling with start and end dates
- 📈 Progress tracking for each task
- 🔗 Task dependencies support
- 🎨 Responsive design with dark/light mode support
- ⚡ Fast and lightweight

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JayEmVey/tiny-project-gantt-chart.git
cd tiny-project-gantt-chart
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
tiny-project-gantt-chart/
├── src/
│   ├── components/
│   │   ├── GanttChart.tsx      # Main Gantt chart component
│   │   └── GanttChart.css      # Gantt chart styles
│   ├── App.tsx                 # Main application component
│   ├── App.css                 # Application styles
│   ├── main.tsx                # Application entry point
│   ├── index.css               # Global styles
│   └── types.ts                # TypeScript type definitions
├── public/                     # Static assets
├── index.html                  # HTML entry point
├── package.json                # Project dependencies
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── .eslintrc.cjs               # ESLint configuration
```

## Usage

The application comes with sample tasks to demonstrate the Gantt chart functionality. You can customize the tasks in `src/App.tsx`:

```typescript
const sampleTasks: Task[] = [
  {
    id: '1',
    name: 'Project Planning',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-15'),
    progress: 100
  },
  // Add more tasks...
]
```

## Task Interface

Each task has the following properties:

```typescript
interface Task {
  id: string              // Unique identifier
  name: string            // Task name
  startDate: Date         // Task start date
  endDate: Date           // Task end date
  progress: number        // Progress percentage (0-100)
  dependencies?: string[] // Array of dependent task IDs
}
```

## Technologies Used

- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [ESLint](https://eslint.org/) - Code linting

## License

MIT

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
