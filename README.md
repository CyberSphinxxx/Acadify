# Acadify

Acadify is an academic productivity platform designed to unify schedule management, task tracking, focus sessions, and note-taking into a single interface. The application is built to support offline capability and data persistence, ensuring accessibility regardless of network conditions.

## Features

### Schedule Management
A visual, interactive weekly grid allows users to manage class schedules and academic commitments. Key capabilities include:
- **Visual Grid**: Drag-and-drop interface for time-block management.
- **Conflict Detection**: Automated identification of overlapping schedules.
- **Subject Organization**: Centralized management of courses and subjects, including color-coded categorization for visual distinction.

### Task Management
The task system supports multiple visualization methods to suit different workflow preferences:
- **Kanban Board**: Stage-based task progression.
- **List View**: Detailed, sortable inventory of pending items.
- **Calendar Integration**: Date-based view for deadline tracking.
- **Task Hierarchy**: Support for main tasks, subtasks, and priority levels.

### Focus Studio
A dedicated environment to minimize distractions and enhance productivity:
- **Session Timer**: Integrated stopwatch and timer functionality for timeboxing work.
- **Task Isolation**: Separation of active focus sessions from the general task backlog to reduce cognitive load.
- **Zen Mode**: Minimalist interface configuration during active sessions.

### Notes System
A rich-text note-taking module integrated with the academic context:
- **Rich Text Editor**: Powered by Tiptap for comprehensive formatting support.
- **Contextual Linking**: Ability to associate notes directly with specific classes or tasks.
- **Organization**: Folder-based grouping and pinning system for quick access to critical information.

### Dashboard
Provides an immediate summary of daily priorities, upcoming schedule items, and recent activity upon authentication.

## Technical Architecture

The project leverages modern web technologies to ensure performance, type safety, and maintainability.

- **Frontend**: React 19, TypeScript, Vite
- **UI/UX**: Tailwind CSS, Shadcn UI, Lucide React
- **Backend & Auth**: Firebase v12 (Firestore, Authentication)
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit/core
- **Form Handling**: React Hook Form, Zod schema validation

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/CyberSphinxxx/Acadify.git
   cd Acadify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory with the following Firebase configuration parameters:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Development Server**
   Start the local development server:
   ```bash
   npm run dev
   ```

## Offline Support

This application utilizes Firestore's persistent local cache. Data is stored locally in the browser's IndexedDB, allowing the application to remain functional without an active internet connection. Changes made offline are automatically synchronized when connectivity is restored.

## License

This project is licensed under the MIT License.
