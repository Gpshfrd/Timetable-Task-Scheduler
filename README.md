# Timetable Task Scheduler

A web application for scheduling tasks for the week with a visual schedule

## Functionality

- **Weekly Calendar** – Displays 5 days (Mon–Fri) with date selection.
- **Creating and editing tasks** – modal windows with a form, time validation (end > start, minimum duration of 15 minutes).
- **Dragging tasks** – from the library to the schedule and between time slots.
- **Conflict checking** – automatic detection of intersections of tasks, offering a free slot.
- **Completion of tasks** – marking completed (strikethrough, changing transparency).
- **Deleting tasks** – from the schedule (right click → edit) or from the library (drag to the trash).
- **The state is saved** in `localStorage`.

## Used Technologies

- **React** (functional components + hooks)
- **TypeScript** – strong typing
- **CSS** (without additional libraries)
- **localStorage** – for storing tasks
- **ESLint + Prettier** – code style

## 📂 Структура проекта (после рефакторинга)

```
src/
├── assets/ # icons, images
├── components/
│ ├── common/ # reusable components
│ │ ├── Modal/ # universal modal window
│ │ └── TaskForm/ # create/edit form for task
│ ├── Calendar/ # mini calendar for date selection and navigation
│ ├── Header/ # application header (currently not in use)
│ ├── ScheduledTask/ # displaying a task in a schedule
│ ├── TaskLibrary/ # library of unplanned tasks
│ ├── TimeTable/ # the main schedule grid
│ └── Workspace/ # main container with timetable and sidebar
├── constants/ # constants (time)
├── hooks/ # custom hooks
│ ├── useTasks.ts # task management (CRUD + localStorage)
│ └── useTaskConflicts.ts # сonflict detection and free slots functions
├── models/ # data types (TaskModel)
├── utils/ # date, time, formatting
├── App.tsx # the root component
├── main.tsx # entry point
└── index.css # global styles and CSS-variables
```

## Installation and launch

1. **Clone the repository**

```bash
git clone <url>
cd timetable
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the progect in dev mode**

```bash
npm run dev
```

4. **Open `http://localhost:5173` or or another port specified in the terminal**

## Using

### Adding a task

Click "+" in the task library (sidebar) → the modal opens.

Enter a name and, if necessary, specify the time (if you create it from a schedule, the start will be substituted automatically based on the clicked location).

Click `Create`, and the task will appear in the library or immediately on the schedule.

### Task planning

Drag a task from the library to the appropriate day and time in the schedule.

Alternatively, click on an empty space in the schedule to open the creation modal with a preset time.

### Editing

Right-click on the task in the **schedule** → the edit modal opens.

Right-click on the task in the **library** → edit the name.

Change the name or time, and click Save or press Enter.

### Completing a task

Left–clicking on a task in the schedule will switch the completed state.

### Removal

**From the schedule**: click on the cross in the upper-right corner of the task (confirmation) or drag the task to the trash button.

**From the library**: Drag the task to the trash button.
