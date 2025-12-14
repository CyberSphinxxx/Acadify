# Changelog

All notable changes to this project will be documented in this file.

## [1.8.6] - 2025-12-14

### Added
- **Empty State**: Added a user-friendly empty state to the Tasks tab, guiding users when no tasks are present or matching filters.

### Changed
- **Delete Confirmation**: Replaced native browser alerts with custom `AlertDialog` components for deleting Tasks, Notes, and Focus Sessions to match the application's premium aesthetic.

### Fixed
- **Task Visibility Bug**: Resolved a critical issue where tasks were disappearing from the Dashboard and Calendar views. The issue was caused by incorrect Firestore Timestamp serialization, which has now been fixed in the service layer with added backward compatibility.
- **Changelog**: Backfilled missing release notes and tags from v1.0.0 to v1.8.5.

## [1.8.5] - 2025-12-13

### Added
- **Dark Mode**: Implemented full dark mode support with a system-aware theme toggle in Profile Settings.

## [1.8.4] - 2025-12-13

### Added
- **Delete All Data**: Users can now permanently delete their account and all associated data (tasks, notes, folders, classes) from the Profile Settings "Hazard Zone".
- **Task Editing**: Tasks can now be edited directly from the Task Board and List views using the new edit button.
- **Hazard Zone UI**: New section in Profile Settings for destructive actions, secured by a confirmation dialog.

### Fixed
- **Dashboard Sync**: Resolved issue where "Study Streak" was stuck at "3 Days" by fetching real data from the user profile.
- **Task Synchronization**: Refactored `Dashboard`, `TodayPage`, and `Tasks` pages to use a unified `useTaskStore`, ensuring immediate UI updates across the app when tasks change.
- **Build Errors**: Fixed unused variable and type errors in `ProfilePage` and `userService`.

### Changed
- **State Management**: Migrated task management in Dashboard and Task pages to `useTaskStore` for better performance and consistency.


## [1.8.3] - 2025-12-12

### Description
Updated the Notes tab interface to handle user interactions more robustly. This change prevents the "add note" button from being spammed, which previously allowed for the creation of multiple empty notes if clicked rapidly.

### Changes Made
- **Button Interaction**: Updated the "add note" button to become disabled immediately upon click and added a loading spinner.
- **Throttling**: Ensured the button remains in a disabled/loading state until the new note is successfully created to prevent duplicate requests.

## [1.8.2] - 2025-12-12

### Description
This release overhauled the Study Streak architecture to ensure consistency between Dashboard and Profile views via Firestore persistence. It also introduced a virtual folder system for Note organization with batch operations, resolved class duplication issues in the Notes UI, and addressed technical debt regarding task schemas.

### Changes Made
- **Note Folder Management**: Implemented a virtual folder system with batch operations for renaming and "soft" deletion (ungrouping). Created a UI workflow for new folders.
- **Fixes**: Resolved visual duplicates in dropdowns for classes with multiple schedule sessions.

## [1.8.1]

### Description
Implemented a synchronized study streak system that persists data to Firebase, ensuring consistency across the application. This update introduced a server-authoritative calculation logic that includes both task creation and completion, along with real-time UI updates on the Dashboard to prevent discrepancies.

### Changes Made
- **Sync Logic**: Created `userService.syncStreak` to aggregate creation and completion dates, ensuring server-authoritative values.
- **Dashboard**: Added a "Study Streak" card with real-time listeners.
- **Data Model**: Added `updatedAt` field to track task completion time more accurately.

## [1.8.0]

### Description
This release officially transitioned the application from a generic template to the **Acadify** identity, featuring a complete visual overhaul of logos and branding assets. Additionally, this update introduced Vercel configuration for seamless SPA deployment and added structured GitHub issue templates to standardise community contributions.

### Changes Made
- **Professional Branding**: Transitioned title to **Acadify** and replaced placeholders with official logos across the Landing Page and Login Screen.

## [1.7.0]

### Description
This update introduced a robust folder organization system for the Notes module and improved privacy within the Focus Studio by isolating session-specific tasks. Additionally, this PR included optimizations for the Schedule Grid, TypeScript fixes for form handling, and a complete rewrite of the project documentation.

### Changes Made
- **Note Organization**: Overhauled Notes to support folder-based organization, including creation, management, and sidebar navigation.
- **Privacy**: Isolated session-specific tasks in Focus Studio.

## [1.6.0]

### Description
This update introduces a new `SubjectList` view and resolves critical crashes within the Schedule module, including validation and ID conflict fixes. It also includes comprehensive improvements to Task Management layouts, Focus Mode state handling, and upgrades core system dependencies.

### Changes Made
- **Schedule & Classes**: Added `SubjectList` view, resolved `FormLabel` crash, and corrected validation schemas.
- **Refactoring**: Refactored `ScheduleGrid` to remove duplicate code.

## [1.5.0]

### Description
Upgraded the Focus Studio into a robust productivity environment. This update introduces database persistence for active sessions, ensuring progress is saved even upon page reload. Additionally, I implemented a new "Resume Dashboard" for managing multiple active goals, enhanced task setup options (deadlines, resources, notes), and improved session controls.

### Changes Made
- **Persistent Focus Sessions**: Implemented logic to save active sessions to the database.
- **Resume Dashboard**: Added a collapsible sidebar to view and switch between active goals.

## [1.4.0]

### Description
Implemented the new Focus Studio workflow to allow users to set main goals and manage sessions. This update also includes necessary cleanup regarding the previous "Brain Dump" implementation and updates the application routing structure.

### Changes Made
- **Cleanup & Routing**: Removed "Brain Dump" component, updated `App.tsx` and `DashboardLayout` routing.
- **Focus Studio**: Implemented logic to manage `activeFocusTaskId` via Local storage or URL.

## [1.3.0]

### Description
This update introduces the **Semester Context** system and delivers major UI/UX improvements to the Schedule and Dashboard modules, significantly enhancing usability, accuracy, and semester-based time logic.

### New Features & Enhancements
- **Semester Settings**: Added a Semester Configuration Dialog to set the Semester Start Date.

## [1.2.0]

## Description
Upgraded the existing Notes module into a comprehensive Knowledge Base system. This update introduced significant improvements to the data model, sidebar navigation, and editor capabilities to support better organization through pinning, tagging, and class linking.

## Changes Made
- **Data Model (`note.ts`):** Updated the `Note` interface to include `isPinned`, `tags`, `relatedClassId`, and a foundation for `folder` structure.
- **Sidebar Refactor (`NotesSidebar.tsx`):**
  - Implemented search functionality to filter notes by title or content.
  - Added a dropdown filter to view notes associated with specific classes.
  - Created a dedicated section for Pinned notes and a Recent list sorted by last edited.
  - Updated UI list items to display the title, snippet, date, and pinned status.
- **Editor Enhancements (`NoteEditor.tsx`):**
  - Added a seamless, large title input field.
  - Implemented an Action Bar containing controls for Pin Toggle, Class Selector, Tag management, and Delete options.
  - Ensured continued support for auto-saving changes.
- **Layout & UI (`Notes.tsx`):**
  - Implemented a split-pane layout with a full-height editor for desktop users.
  - Added responsive design support featuring a collapsible sidebar (Sheet component) for mobile.
  - Added `dropdown-menu` to `src/components/ui` to support new UI interactions.

## How It Works
The system now separates pinned notes from the general list for quick access. Users can categorize notes by linking them to a class schedule or adding custom tags via the new editor Action Bar. The sidebar provides real-time filtering based on text search or class selection.

## Notes
- The `folder` property was added to the data model to lay the foundation for future structural organization features.

## [1.1.0]

### Description
Upgraded the Tasks module to a full-featured Task Manager. This update involved expanding the data model to support richer task details, implementing a multi-view system (List, Board, and Calendar), and enhancing the task creation workflow.

### Changes Made
- **Data Model Upgrade**
  * Updated `Task` interface in `task.ts` to include `priority` ('LOW', 'MEDIUM', 'HIGH'), `dueDate`, `relatedClassId`, and recurrence settings (`isRecurring` & `recurrencePattern`).
- **View Switcher & New Views**
  * Added tabs to the Tasks Page header to switch between List, Board, and Calendar views.
  * Implemented `TaskListView.tsx`: Groups tasks by timeframe (Overdue, Today, This Week, Later, Completed) and displays priority badges and due dates.
  * Implemented `TaskBoardView.tsx`: Migrated previous Kanban-style board implementation.
  * Implemented `TaskCalendarView.tsx`: Added a monthly calendar grid with visual task indicators and support for adding tasks to specific dates.
* **Enhanced Add Task Dialog**
  * Updated `AddTaskDialog.tsx` to include a color-coded Priority selector and Due Date picker.
  * Added a Class selector that fetches classes from the Schedule.
  * Added logic to pre-fill the date when the dialog is opened from the Calendar view.
* **New Store**
  * Created `useScheduleStore.ts` to manage and fetch class data for the task form.

# How It Works
The Tasks module now supports three distinct views:
1. **List View:** For a chronological overview of deadlines.
2. **Board View:** For Kanban-style status management.
3. **Calendar View:** For visual monthly planning.

When using the Calendar view, clicking on a specific day opens the `AddTaskDialog` with that date pre-selected.

# Notes
* The Board View was moved from the previous implementation into `TaskBoardView.tsx` to fit the new architecture.

## [1.0.0]

### Summary
This release establishes the core foundation of Acadify, introducing a personalized Dashboard, a fully functional Kanban Task board, and a rich-text Notes system with auto-save. It integrates secure Firebase authentication and real-time data synchronization across all modules.

## New Features
*   **Dashboard**: real-time overview displaying today's class count, free time gaps, and immediate task deadlines.
*   **Tasks System**: Kanban board with drag-and-drop capabilities (Todo, In Progress, Done) for effective assignment tracking.
*   **Notes App**: Integrated rich-text editor (Tiptap) featuring:
    *   Formatting toolbar (Bold, Italic, Headers).
    *   Auto-save functionality (debounced).
    *   Sidebar navigation for quick switching between notes.
*   **Authentication**: Google Sign-in integration via Firebase Authentication.

## Maintenance
*   **Component Architecture**: structured codebase into feature-specific folders (`components/features/`) for better scalability.
*   **UI Foundation**: Implemented Shadcn UI components and Tailwind CSS for a consistent, premium design.
*   **Type Safety**: Comprehensive TypeScript definitions for `Task`, `Note`, and `Schedule` entities.
*   **Performance**: Implemented debounce hooks for efficient write operations to Firestore.