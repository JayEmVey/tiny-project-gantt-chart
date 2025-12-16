# Testing Quick Start Guide

This guide provides quick instructions for testing the Tiny Project Gantt Chart application.

## Prerequisites

- Node.js 18+ installed
- npm installed
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Quick Test Commands

### 1. Start Development Server

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/JayEmVey/tiny-project-gantt-chart.git
cd tiny-project-gantt-chart

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The terminal will display a URL like:
```
➜  Local:   http://localhost:5173/tiny-project-gantt-chart/
```

Open this URL in your browser.

---

### 2. Test Build (Check for Errors)

In a separate terminal window:

```bash
# Build the project to check for TypeScript/compilation errors
npm run build
```

Expected output should end with:
```
✓ built in X.XXs
```

No errors should appear.

---

### 3. Test Production Build

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

Open the URL shown in the terminal to test the production version.

---

## Quick Functionality Test (5 minutes)

Once the dev server is running, perform these quick tests:

### ✅ Test 1: Create Items (30 seconds)
1. Click the "+" button in the sidebar
2. Create a new Epic
3. Create a new User Story (assign it to the epic)
4. Create a new Task (assign it to the user story)

**Expected:** All items appear in the sidebar hierarchy

---

### ✅ Test 2: Drag and Drop (1 minute)
1. Expand an epic to see user stories
2. Drag one user story over another
3. Release to reorder

**Expected:**
- Semi-transparent visual feedback while dragging
- Blue line indicator at drop position
- Items reorder after drop

---

### ✅ Test 3: Gantt Chart Interaction (1 minute)
1. Locate a task bar in the Gantt chart
2. Click and drag the bar horizontally
3. Release to change dates

**Expected:** Task bar moves smoothly and dates update

---

### ✅ Test 4: Save/Load Project (1 minute)
1. Press `Ctrl+S` (or `Cmd+S` on Mac)
2. A .json file should download
3. Click File → Open Project
4. Select the downloaded file

**Expected:**
- File downloads successfully
- Project loads back with all data intact

---

### ✅ Test 5: Export (1 minute)
1. Click the "Export" button
2. Select "Image (PNG)"
3. Click "Export"

**Expected:** PNG image of the Gantt chart downloads

---

### ✅ Test 6: Zoom and Navigate (30 seconds)
1. Click "Week" button to change zoom level
2. Click "Today" button to navigate to current date
3. Use arrow buttons to scroll timeline

**Expected:**
- Chart transitions smoothly between zoom levels
- Navigation scrolls the timeline appropriately

---

## Comprehensive Testing

For detailed test cases covering all features, see [TEST_CASES.md](TEST_CASES.md).

The comprehensive test suite includes:
- 48+ detailed test cases
- All drag and drop scenarios
- CRUD operations for all entities
- Edge cases and error handling
- Performance and accessibility tests

---

## Common Issues and Solutions

### Issue: Port 5173 is already in use

**Solution:** Vite will automatically try the next available port (5174, 5175, etc.). Use the URL shown in your terminal.

---

### Issue: Build fails with TypeScript errors

**Solution:**
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Try building again:
   ```bash
   npm run build
   ```

---

### Issue: Drag and drop not working

**Solution:**
1. Ensure you're using a modern browser (Chrome 90+, Firefox 88+, Safari 14+)
2. Check browser console for errors (F12 → Console tab)
3. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

### Issue: Items not appearing in Gantt chart

**Solution:**
1. Check that epics/user stories are checked (selected) in the sidebar
2. Ensure tasks have valid dates in DD/MM/YYYY format
3. Try navigating to the date range of your tasks using zoom controls

---

## Reporting Test Results

After testing, please report:

### Success ✅
- Create a GitHub issue titled "Test Results - [Date]"
- List which test cases passed
- Include your browser/OS info

### Failures ❌
- Create a GitHub issue for each bug found
- Include:
  - Test case that failed
  - Steps to reproduce
  - Expected vs. actual behavior
  - Screenshots if applicable
  - Browser and OS version

**GitHub Issues:** https://github.com/JayEmVey/tiny-project-gantt-chart/issues

---

## Automated Testing (Future)

Currently, this project uses manual testing. Future improvements may include:
- Jest/Vitest for unit tests
- React Testing Library for component tests
- Playwright/Cypress for E2E tests

Contributions welcome!

---

## Need Help?

- Check [README.md](README.md) for general usage
- Review [TEST_CASES.md](TEST_CASES.md) for detailed scenarios
- Open an issue on GitHub if you encounter problems

---

**Last Updated:** 2025-10-17
