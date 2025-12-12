# Changelog

All notable changes to this project will be documented in this file.

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
