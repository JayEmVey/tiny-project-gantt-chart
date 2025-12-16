import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base for GitHub Pages (repository name). Adjust if you fork under a different name.
  base: '/tiny-project-gantt-chart/',
})
