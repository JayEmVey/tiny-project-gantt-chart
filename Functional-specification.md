

Here’s a structured functional specification draft:

---

# Functional Specification – Gantt Chart Board Application

## 1. Overview

The application provides a **visual Gantt chart board** for managing tasks, projects, and dependencies. Users can create, view, and update tasks directly from the Gantt chart, ensuring intuitive project planning and progress tracking.

---

## 2. Actors / Users

* **Project Manager** – oversees schedules, dependencies, and deadlines.
* **Team Member** – updates tasks assigned to them.
* **Stakeholder/Viewer** – views timelines and progress but cannot edit.

---

## 3. Functional Requirements

### FR-01: Task Visualization on Gantt Chart

* The system shall display all tasks as horizontal bars on a timeline.
* Each bar represents a task’s duration (start date to due date).
* The chart shall support zoom levels (day, week, month, quarter).

---

### FR-02: Task Creation

* Users shall be able to create a new task by:

  * Clicking a button (“+ New Task”).
  * Drawing a new bar directly on the timeline.
* The system shall prompt for:

  * Task name
  * Start date
  * Due date
  * Assignee (optional)
  * Priority/status (optional)

---

### FR-03: Task Editing & Updates

* Users shall drag task bars to change dates.
* Users shall resize task bars to adjust start/end dates.
* Users shall open a task details panel by clicking the bar, where they can edit:

  * Title, description, status, priority, assignee.
* Edits shall save automatically and update the chart in real time.

---

### FR-04: Dependencies

* Users shall be able to create dependencies between tasks:

  * Dragging from one task to another creates a dependency line.
* Dependency types supported:

  * Finish-to-Start (default).
  * Start-to-Start, Finish-to-Finish (optional).
* The system shall enforce constraints (e.g., dependent tasks cannot start before predecessors finish).

---

### FR-05: Task States & Progress

* The system shall allow users to mark task progress (e.g., % complete).
* Bars shall visually reflect status:

  * **In progress** – partially shaded bar.
  * **Completed** – fully shaded bar.
  * **Overdue** – bar highlighted in red.

---

### FR-06: Filtering & Sorting

* Users shall filter tasks by:

  * Assignee, status, priority, or project.
* Users shall sort tasks by start date, due date, or dependency order.
* A search box shall allow finding tasks by name.

---

### FR-07: Critical Path

* The system shall calculate and highlight the **critical path** of tasks.
* Critical tasks shall be marked visually (e.g., bold outline or special color).

---

### FR-08: Collaboration & Permissions

* The system shall support multiple users editing the chart.
* Changes shall sync in real time for all viewers.
* Permissions:

  * **Editor**: can create/edit/delete tasks.
  * **Viewer**: can only see tasks.

---

### FR-09: Export & Sharing

* The system shall allow exporting the Gantt chart as:

  * PDF
  * PNG
  * CSV (task list with dates & dependencies).
* Users shall be able to share a read-only public link.

---

### FR-10: Performance Constraints

* The Gantt chart must render at least **200 tasks smoothly**.
* Date adjustments must save within **2 seconds**.
* UI must remain responsive during zoom, scroll, or filtering.

---

## 4. Non-Functional Requirements

* **Usability**: Intuitive drag-and-drop interface.
* **Scalability**: Should handle multiple projects and hundreds of tasks.
* **Security**: Role-based access (viewer/editor/admin).
* **Cross-Platform**: Accessible via modern browsers (Chrome, Edge, Safari, Firefox).

