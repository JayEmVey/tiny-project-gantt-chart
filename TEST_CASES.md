# UI/UX Test Cases - Tiny Project Gantt Chart

This document provides comprehensive test cases to validate the functionality and user experience of the Gantt chart web application.

## Table of Contents
1. [Setup Instructions](#setup-instructions)
2. [Drag and Drop Functionality Tests](#drag-and-drop-functionality-tests)
3. [Epic Management Tests](#epic-management-tests)
4. [User Story Management Tests](#user-story-management-tests)
5. [Task Management Tests](#task-management-tests)
6. [Gantt Chart View Tests](#gantt-chart-view-tests)
7. [Project Management Tests](#project-management-tests)
8. [Export/Import Tests](#exportimport-tests)
9. [Navigation and Zoom Tests](#navigation-and-zoom-tests)
10. [UI/UX Responsiveness Tests](#uiux-responsiveness-tests)

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm (comes with Node)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Running the Test Environment

1. **Clone and Install Dependencies**
   ```bash
   git clone https://github.com/JayEmVey/tiny-project-gantt-chart.git
   cd tiny-project-gantt-chart
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - The terminal will display a URL (e.g., `http://localhost:5173/tiny-project-gantt-chart/`)
   - Open this URL in your browser
   - Keep the terminal open while testing

4. **Build and Test Production**
   ```bash
   npm run build
   npm run preview
   ```

---

## Drag and Drop Functionality Tests

### Test Case 1.1: Drag and Drop Epics
**Objective:** Verify that epics can be reordered via drag and drop

**Steps:**
1. Open the application in the browser
2. Ensure the sidebar (task list) is visible on the left
3. Look for epics in the list (they have purple color indicators)
4. Click and hold on "Epic 1"
5. Drag it over "Epic 2"
6. Release the mouse button

**Expected Results:**
- ✅ While dragging, the epic appears semi-transparent (50% opacity)
- ✅ A blue line indicator appears at the drop position
- ✅ Cursor changes to indicate draggable item
- ✅ After dropping, "Epic 1" and "Epic 2" swap positions
- ✅ The Gantt chart view updates to reflect the new order

**Status:** [ ] Pass [ ] Fail

---

### Test Case 1.2: Drag and Drop User Stories Within Same Epic
**Objective:** Verify that user stories can be reordered within the same epic

**Steps:**
1. Click the expand arrow next to "Epic 1" to show user stories
2. Identify at least 2 user stories under "Epic 1" (green color indicators)
3. Click and hold on "User Story 1"
4. Drag it over "User Story 2"
5. Release the mouse button

**Expected Results:**
- ✅ While dragging, the user story appears semi-transparent
- ✅ A blue line indicator shows the drop position
- ✅ After dropping, the user stories swap positions
- ✅ The reordering only affects user stories within "Epic 1"
- ✅ The Gantt chart reflects the new order

**Status:** [ ] Pass [ ] Fail

---

### Test Case 1.3: Prevent User Story Drag Across Different Epics
**Objective:** Verify that user stories cannot be moved to different epics

**Steps:**
1. Expand "Epic 1" and "Epic 2"
2. Try to drag "User Story 1" (from Epic 1) over to "User Story 3" (from Epic 2)
3. Release the mouse button

**Expected Results:**
- ✅ The drag operation does not reorder the items
- ✅ "User Story 1" remains under "Epic 1"
- ✅ No changes occur in the task list structure

**Status:** [ ] Pass [ ] Fail

---

### Test Case 1.4: Drag and Drop Tasks Within Same User Story
**Objective:** Verify that tasks can be reordered within the same user story

**Steps:**
1. Expand "Epic 1" → "User Story 1"
2. Identify at least 2 tasks under "User Story 1" (blue color indicators)
3. Click and hold on "Task 1"
4. Drag it over "Task 2"
5. Release the mouse button

**Expected Results:**
- ✅ While dragging, the task appears semi-transparent
- ✅ A blue line indicator shows the drop position
- ✅ After dropping, the tasks swap positions
- ✅ The reordering only affects tasks within "User Story 1"
- ✅ The Gantt chart reflects the new order

**Status:** [ ] Pass [ ] Fail

---

### Test Case 1.5: Prevent Task Drag Across Different User Stories
**Objective:** Verify that tasks cannot be moved to different user stories

**Steps:**
1. Expand "Epic 1" → "User Story 1" and "User Story 2"
2. Try to drag "Task 1" (from User Story 1) over to tasks in "User Story 2"
3. Release the mouse button

**Expected Results:**
- ✅ The drag operation does not reorder the items
- ✅ "Task 1" remains under "User Story 1"
- ✅ No changes occur in the task list structure

**Status:** [ ] Pass [ ] Fail

---

## Epic Management Tests

### Test Case 2.1: Create New Epic
**Objective:** Verify epic creation functionality

**Steps:**
1. Click the "+" (Add) button in the sidebar header
2. Select "New Epic" from the dropdown menu
3. Enter "Test Epic" as the name
4. Set assignee as "John Doe"
5. Set status as "In Progress"
6. Set priority as "High"
7. Click "Save"

**Expected Results:**
- ✅ Modal opens for epic creation
- ✅ Form fields are properly labeled and functional
- ✅ After saving, "Test Epic" appears in the epic list
- ✅ The epic has the correct properties (assignee, status, priority)

**Status:** [ ] Pass [ ] Fail

---

### Test Case 2.2: Edit Existing Epic
**Objective:** Verify epic editing functionality

**Steps:**
1. Double-click on "Epic 1" in the task list
2. Change the name to "Epic 1 - Updated"
3. Change priority to "Low"
4. Click "Save"

**Expected Results:**
- ✅ Modal opens with current epic data pre-filled
- ✅ Changes are reflected in the task list after saving
- ✅ Related user stories and tasks remain intact

**Status:** [ ] Pass [ ] Fail

---

### Test Case 2.3: Delete Epic
**Objective:** Verify epic deletion with cascade

**Steps:**
1. Check the checkbox next to "Epic 3"
2. Click the trash icon button in the header
3. Confirm the deletion in the popup dialog

**Expected Results:**
- ✅ Confirmation dialog appears with warning message
- ✅ After confirmation, "Epic 3" is removed
- ✅ All user stories under "Epic 3" are also deleted
- ✅ All tasks under those user stories are also deleted
- ✅ The Gantt chart updates accordingly

**Status:** [ ] Pass [ ] Fail

---

### Test Case 2.4: Clone Epic
**Objective:** Verify epic cloning functionality

**Steps:**
1. Check the checkbox next to "Epic 1"
2. Click the copy icon button in the header
3. Observe the task list

**Expected Results:**
- ✅ A new epic appears named "Epic 1 (Copy)"
- ✅ All user stories under "Epic 1" are also cloned with " (Copy)" suffix
- ✅ All tasks are also cloned
- ✅ The cloned items are independent of the originals

**Status:** [ ] Pass [ ] Fail

---

### Test Case 2.5: Toggle Epic Visibility
**Objective:** Verify epic selection affects chart visibility

**Steps:**
1. Uncheck the checkbox next to "Epic 1"
2. Observe the Gantt chart
3. Check the checkbox again

**Expected Results:**
- ✅ When unchecked, "Epic 1" and its items disappear from the Gantt chart
- ✅ The task list sidebar still shows "Epic 1"
- ✅ When checked again, items reappear in the Gantt chart

**Status:** [ ] Pass [ ] Fail

---

## User Story Management Tests

### Test Case 3.1: Create New User Story
**Objective:** Verify user story creation functionality

**Steps:**
1. Click the "+" (Add) button
2. Select "New User Story"
3. Enter "Test User Story" as the name
4. Select "Epic 1" from the epic dropdown
5. Click "Save"

**Expected Results:**
- ✅ Modal opens for user story creation
- ✅ Epic dropdown shows all available epics
- ✅ After saving, "Test User Story" appears under "Epic 1"

**Status:** [ ] Pass [ ] Fail

---

### Test Case 3.2: Edit User Story
**Objective:** Verify user story editing functionality

**Steps:**
1. Expand "Epic 1"
2. Double-click on "User Story 1"
3. Change the name to "User Story 1 - Updated"
4. Click "Save"

**Expected Results:**
- ✅ Modal opens with current data
- ✅ Changes are saved and reflected in the list
- ✅ Related tasks remain intact

**Status:** [ ] Pass [ ] Fail

---

### Test Case 3.3: Delete User Story
**Objective:** Verify user story deletion with cascade

**Steps:**
1. Expand "Epic 1"
2. Check the checkbox next to "User Story 2"
3. Note: Currently, there's no direct delete button for individual user stories in the header
4. Double-click to open the edit modal
5. Click "Delete" button in the modal

**Expected Results:**
- ✅ Confirmation is requested
- ✅ User story is removed from the list
- ✅ All tasks under that user story are also deleted

**Status:** [ ] Pass [ ] Fail

---

## Task Management Tests

### Test Case 4.1: Create New Task
**Objective:** Verify task creation functionality

**Steps:**
1. Click the "+" (Add) button
2. Select "New Task"
3. Fill in the following:
   - Process: "Test Task"
   - Start Date: "01/11/2025"
   - End Date: "15/11/2025"
   - Assignee: "Jane Smith"
   - Status: "Not Started"
   - Priority: "Medium"
   - Select Epic: "Epic 1"
   - Select User Story: "User Story 1"
4. Click "Save"

**Expected Results:**
- ✅ Modal opens with all form fields
- ✅ Date pickers work correctly with DD/MM/YYYY format
- ✅ Epic and User Story dropdowns are populated
- ✅ Task appears in the list under "User Story 1"
- ✅ Task bar appears in the Gantt chart at the correct date range

**Status:** [ ] Pass [ ] Fail

---

### Test Case 4.2: Edit Task
**Objective:** Verify task editing functionality

**Steps:**
1. Click on "Task 1" in the sidebar (or click its bar in the Gantt chart)
2. Change the process name to "Task 1 - Updated"
3. Change the dates
4. Click "Save"

**Expected Results:**
- ✅ Modal opens with pre-filled data
- ✅ Changes are saved and reflected in both sidebar and chart
- ✅ Task bar moves to the new date range in the chart

**Status:** [ ] Pass [ ] Fail

---

### Test Case 4.3: Delete Task
**Objective:** Verify task deletion functionality

**Steps:**
1. Click on "Task 3" to open the modal
2. Click the "Delete" button
3. Confirm deletion

**Expected Results:**
- ✅ Task is removed from the sidebar
- ✅ Task bar disappears from the Gantt chart
- ✅ No other tasks are affected

**Status:** [ ] Pass [ ] Fail

---

## Gantt Chart View Tests

### Test Case 5.1: Drag Task Bar to Change Dates
**Objective:** Verify that task bars can be dragged to change dates

**Steps:**
1. In the Gantt chart, locate a task bar
2. Click and hold on the middle of the bar
3. Drag it horizontally to a new date range
4. Release the mouse button

**Expected Results:**
- ✅ While dragging, the bar moves with the cursor
- ✅ Visual feedback indicates the new date range
- ✅ After releasing, the task dates are updated
- ✅ The sidebar reflects the new dates if you open the task modal

**Status:** [ ] Pass [ ] Fail

---

### Test Case 5.2: Resize Task Bar from Left Edge
**Objective:** Verify start date can be changed by resizing

**Steps:**
1. Hover over the left edge of a task bar
2. Cursor should change to indicate resize capability
3. Click and drag the left edge
4. Release the mouse button

**Expected Results:**
- ✅ Cursor changes to resize cursor
- ✅ Only the start date changes (end date remains fixed)
- ✅ Bar width adjusts accordingly
- ✅ Task data is updated

**Status:** [ ] Pass [ ] Fail

---

### Test Case 5.3: Resize Task Bar from Right Edge
**Objective:** Verify end date can be changed by resizing

**Steps:**
1. Hover over the right edge of a task bar
2. Click and drag the right edge
3. Release the mouse button

**Expected Results:**
- ✅ Cursor changes to resize cursor
- ✅ Only the end date changes (start date remains fixed)
- ✅ Bar width adjusts accordingly
- ✅ Task data is updated

**Status:** [ ] Pass [ ] Fail

---

### Test Case 5.4: Click Empty Cell to Create Task
**Objective:** Verify task creation by clicking empty chart area

**Steps:**
1. Click on an empty cell in the Gantt chart timeline
2. Observe the modal that opens

**Expected Results:**
- ✅ Task modal opens with start date pre-filled based on clicked date
- ✅ End date is set to 7 days after start date by default
- ✅ User can fill in task details and save

**Status:** [ ] Pass [ ] Fail

---

### Test Case 5.5: View Task Progress Bar
**Objective:** Verify progress visualization on task bars

**Steps:**
1. Create or edit a task with 60% progress
2. Save and view in the Gantt chart

**Expected Results:**
- ✅ Task bar shows visual progress indicator (darker overlay)
- ✅ Progress indicator represents 60% of the bar width

**Status:** [ ] Pass [ ] Fail

---

### Test Case 5.6: View Milestone Indicators
**Objective:** Verify milestones appear on the chart

**Steps:**
1. Add a milestone with a specific date
2. View the Gantt chart

**Expected Results:**
- ✅ Milestone appears as a diamond or marker on the timeline
- ✅ Milestone name is visible
- ✅ Milestone appears at the correct date

**Status:** [ ] Pass [ ] Fail

---

## Project Management Tests

### Test Case 6.1: Create New Project
**Objective:** Verify new project creation

**Steps:**
1. Click "File" menu (or equivalent)
2. Select "New Project"
3. Confirm the action when prompted

**Expected Results:**
- ✅ Confirmation dialog warns about unsaved changes
- ✅ After confirming, all epics, user stories, and tasks are cleared
- ✅ Project name changes to "New Project"
- ✅ Gantt chart is empty

**Status:** [ ] Pass [ ] Fail

---

### Test Case 6.2: Save Project
**Objective:** Verify project save functionality

**Steps:**
1. Make some changes to the project (add tasks, epics, etc.)
2. Press Ctrl+S (or Cmd+S on Mac)
3. Or click "File" → "Save Project"

**Expected Results:**
- ✅ File download dialog appears
- ✅ A .json file is downloaded
- ✅ Success message appears
- ✅ "Unsaved changes" indicator (if present) clears

**Status:** [ ] Pass [ ] Fail

---

### Test Case 6.3: Open Saved Project
**Objective:** Verify project can be loaded from file

**Steps:**
1. Click "File" → "Open Project"
2. Select a previously saved .json project file
3. Observe the application

**Expected Results:**
- ✅ File picker dialog opens
- ✅ After selecting file, all data loads correctly
- ✅ Epics, user stories, tasks, and milestones appear
- ✅ Gantt chart renders with correct task bars
- ✅ Success message appears

**Status:** [ ] Pass [ ] Fail

---

### Test Case 6.4: Edit Project Name
**Objective:** Verify project name can be changed

**Steps:**
1. Locate the project name field in the header
2. Click on it to edit
3. Type "My Test Project"
4. Press Enter or click outside

**Expected Results:**
- ✅ Project name field is editable
- ✅ Name updates after editing
- ✅ New name appears in the header

**Status:** [ ] Pass [ ] Fail

---

## Export/Import Tests

### Test Case 7.1: Export as PNG Image
**Objective:** Verify chart can be exported as PNG

**Steps:**
1. Click "Export" button
2. Select "Image (PNG)" as file type
3. Choose view mode (Day/Week/Month)
4. Click "Export"

**Expected Results:**
- ✅ Export modal opens with options
- ✅ PNG file downloads
- ✅ Image contains the complete Gantt chart
- ✅ Image quality is acceptable

**Status:** [ ] Pass [ ] Fail

---

### Test Case 7.2: Export as PDF
**Objective:** Verify chart can be exported as PDF

**Steps:**
1. Click "Export" button
2. Select "PDF" as file type
3. Choose view mode
4. Click "Export"

**Expected Results:**
- ✅ PDF file downloads
- ✅ PDF contains the Gantt chart in landscape orientation
- ✅ Content is properly sized for A4 paper

**Status:** [ ] Pass [ ] Fail

---

### Test Case 7.3: Export with Different Zoom Levels
**Objective:** Verify export respects zoom level selection

**Steps:**
1. Open export modal
2. Select "Week" view mode
3. Export as PNG
4. Repeat with "Month" view mode

**Expected Results:**
- ✅ Week view export shows weekly columns
- ✅ Month view export shows monthly columns
- ✅ Content adjusts appropriately for each zoom level

**Status:** [ ] Pass [ ] Fail

---

## Navigation and Zoom Tests

### Test Case 8.1: Change Zoom Level (Day/Week/Month/Quarter)
**Objective:** Verify zoom level controls work correctly

**Steps:**
1. Click the "Day" button in the view controls
2. Click the "Week" button
3. Click the "Month" button
4. Click the "Quarter" button

**Expected Results:**
- ✅ Chart transitions smoothly between zoom levels
- ✅ Day view shows individual days
- ✅ Week view shows weeks
- ✅ Month view shows months
- ✅ Quarter view shows quarters
- ✅ Task bars adjust to fit the scale

**Status:** [ ] Pass [ ] Fail

---

### Test Case 8.2: Navigate to Today
**Objective:** Verify "Today" navigation button

**Steps:**
1. Scroll the Gantt chart far from today's date
2. Click the "Today" button in the view controls

**Expected Results:**
- ✅ Chart scrolls smoothly to center on today's date
- ✅ Current day indicator (yellow line) is visible

**Status:** [ ] Pass [ ] Fail

---

### Test Case 8.3: Navigate Left/Right
**Objective:** Verify timeline navigation arrows

**Steps:**
1. Click the left arrow button in view controls
2. Click the right arrow button

**Expected Results:**
- ✅ Left arrow scrolls the timeline left (earlier dates)
- ✅ Right arrow scrolls the timeline right (later dates)
- ✅ Smooth scrolling animation occurs

**Status:** [ ] Pass [ ] Fail

---

### Test Case 8.4: Zoom In/Out with Buttons
**Objective:** Verify zoom scale controls

**Steps:**
1. Click the "+" button multiple times
2. Click the "-" button multiple times
3. Click the "Reset" button

**Expected Results:**
- ✅ "+" button increases the scale (makes content larger)
- ✅ "-" button decreases the scale (makes content smaller)
- ✅ "Reset" button returns to 100% scale
- ✅ Content remains centered during zoom

**Status:** [ ] Pass [ ] Fail

---

### Test Case 8.5: Keyboard Shortcuts for Zoom
**Objective:** Verify keyboard shortcuts work

**Steps:**
1. Press Ctrl++ (or Cmd++ on Mac)
2. Press Ctrl+- (or Cmd+- on Mac)
3. Press Ctrl+0 (or Cmd+0 on Mac)

**Expected Results:**
- ✅ Ctrl++ zooms in
- ✅ Ctrl+- zooms out
- ✅ Ctrl+0 resets zoom
- ✅ Default browser zoom is prevented

**Status:** [ ] Pass [ ] Fail

---

### Test Case 8.6: Save with Keyboard Shortcut
**Objective:** Verify Ctrl+S/Cmd+S saves the project

**Steps:**
1. Make a change to the project
2. Press Ctrl+S (or Cmd+S on Mac)

**Expected Results:**
- ✅ Save dialog/download occurs
- ✅ Browser's default "Save Page" is prevented

**Status:** [ ] Pass [ ] Fail

---

## UI/UX Responsiveness Tests

### Test Case 9.1: Collapse/Expand Sidebar
**Objective:** Verify sidebar toggle functionality

**Steps:**
1. Click the "Hide sidebar" button (chevron icon)
2. Observe the layout
3. Click the "Show sidebar" button

**Expected Results:**
- ✅ Sidebar smoothly collapses to hidden
- ✅ Gantt chart expands to fill the space
- ✅ Expand button remains visible
- ✅ Sidebar smoothly expands back

**Status:** [ ] Pass [ ] Fail

---

### Test Case 9.2: Expand/Collapse All Items
**Objective:** Verify expand/collapse all button

**Steps:**
1. Click the expand/collapse all button (top of sidebar)
2. Observe all epics
3. Click again

**Expected Results:**
- ✅ First click expands all epics and user stories
- ✅ All hierarchical items are visible
- ✅ Second click collapses everything
- ✅ Icon changes between expand and collapse states

**Status:** [ ] Pass [ ] Fail

---

### Test Case 9.3: Check/Uncheck All Epics
**Objective:** Verify bulk selection checkbox

**Steps:**
1. Locate the "Check/Uncheck All" checkbox
2. Check it
3. Observe the Gantt chart
4. Uncheck it

**Expected Results:**
- ✅ Checking it selects all epics
- ✅ All user stories also get selected
- ✅ All items appear in the Gantt chart
- ✅ Unchecking hides all items from the chart

**Status:** [ ] Pass [ ] Fail

---

### Test Case 9.4: Font Size Options
**Objective:** Verify font size settings

**Steps:**
1. Click on font size controls in the header (if available)
2. Select "Larger"
3. Select "Smaller"
4. Select "Medium"

**Expected Results:**
- ✅ Text size increases when "Larger" is selected
- ✅ Text size decreases when "Smaller" is selected
- ✅ Text returns to default with "Medium"
- ✅ Setting persists after page refresh

**Status:** [ ] Pass [ ] Fail

---

### Test Case 9.5: View Type Toggle (Task/User Story/Epic)
**Objective:** Verify view type changes chart grouping

**Steps:**
1. Select "Task" view type
2. Select "User Story" view type
3. Select "Epic" view type

**Expected Results:**
- ✅ Task view shows individual tasks as rows
- ✅ User Story view groups tasks under user stories
- ✅ Epic view groups tasks under epics
- ✅ Chart re-renders appropriately for each view

**Status:** [ ] Pass [ ] Fail

---

### Test Case 9.6: Critical Path Toggle
**Objective:** Verify critical path visualization

**Steps:**
1. Create tasks with dependencies
2. Toggle "Show Critical Path" option
3. Observe the chart

**Expected Results:**
- ✅ Critical path tasks are highlighted differently
- ✅ Dependency lines are visible
- ✅ Non-critical tasks appear normal

**Status:** [ ] Pass [ ] Fail

---

### Test Case 9.7: Responsive Design - Mobile View
**Objective:** Verify application works on smaller screens

**Steps:**
1. Open browser developer tools (F12)
2. Toggle device emulation to mobile (e.g., iPhone, Android)
3. Interact with the application

**Expected Results:**
- ✅ Layout adjusts for mobile screen
- ✅ Sidebar may auto-collapse or be toggleable
- ✅ Touch gestures work for drag operations
- ✅ Buttons remain accessible

**Status:** [ ] Pass [ ] Fail

---

### Test Case 9.8: Browser Compatibility
**Objective:** Verify cross-browser functionality

**Steps:**
1. Test in Chrome
2. Test in Firefox
3. Test in Safari (if available)
4. Test in Edge

**Expected Results:**
- ✅ Application loads correctly in all browsers
- ✅ Drag and drop works in all browsers
- ✅ Visual appearance is consistent
- ✅ No console errors occur

**Status:** [ ] Pass [ ] Fail

---

## Performance Tests

### Test Case 10.1: Large Dataset Handling
**Objective:** Verify performance with many items

**Steps:**
1. Create 10 epics
2. Create 5 user stories per epic (50 total)
3. Create 10 tasks per user story (500 total)
4. Interact with the chart

**Expected Results:**
- ✅ Application remains responsive
- ✅ Scrolling is smooth
- ✅ Drag operations work without lag
- ✅ No browser crashes or freezes

**Status:** [ ] Pass [ ] Fail

---

### Test Case 10.2: Memory Leak Check
**Objective:** Verify no memory leaks during extended use

**Steps:**
1. Open browser developer tools → Performance/Memory tab
2. Record memory usage
3. Perform various operations for 10 minutes
4. Check memory usage again

**Expected Results:**
- ✅ Memory usage stabilizes after initial operations
- ✅ No continuous memory growth
- ✅ No significant memory leaks detected

**Status:** [ ] Pass [ ] Fail

---

## Accessibility Tests

### Test Case 11.1: Keyboard Navigation
**Objective:** Verify application is keyboard-accessible

**Steps:**
1. Use Tab key to navigate through elements
2. Use Enter/Space to activate buttons
3. Use arrow keys where applicable

**Expected Results:**
- ✅ Focus indicator is visible
- ✅ All interactive elements are reachable
- ✅ Logical tab order
- ✅ Keyboard shortcuts work

**Status:** [ ] Pass [ ] Fail

---

### Test Case 11.2: Screen Reader Compatibility
**Objective:** Verify screen reader support (if applicable)

**Steps:**
1. Enable screen reader (e.g., NVDA, JAWS, VoiceOver)
2. Navigate through the application
3. Perform basic operations

**Expected Results:**
- ✅ Elements are properly announced
- ✅ Labels and descriptions are clear
- ✅ Interactive elements are identifiable

**Status:** [ ] Pass [ ] Fail

---

## Summary

After completing all test cases, tally the results:

- **Total Test Cases:** 48
- **Passed:** ___
- **Failed:** ___
- **Skipped:** ___

---

## Reporting Issues

If you encounter any bugs or issues:

1. Note the test case number and name
2. Provide detailed steps to reproduce
3. Include screenshots if possible
4. Note your browser and OS version
5. Report via GitHub Issues: https://github.com/JayEmVey/tiny-project-gantt-chart/issues

---

## Notes

- Some test cases may require manual verification
- Visual aspects should be checked against design specifications
- Performance tests depend on the testing machine's capabilities
- Accessibility tests may require specialized tools

---

**Last Updated:** 2025-10-17
