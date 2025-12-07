# Project: Acadify

A comprehensive academic productivity application (LMS/Productivity
hybrid).

## 1. System Rules & Preferences (AI Instructions)

**Role:** Senior Frontend Engineer specialized in React, TypeScript, and
UX Design.\
**Styling Engine:** Tailwind CSS only. No custom CSS files unless for
complex keyframe animations.\
**Component Library:** shadcn/ui. Prefer existing components (Card,
Dialog, Popover).\
**State Management:**\
- **Global UI State:** Zustand (Sidebar, Modals)\
- **Server State:** React Query v5 (TanStack Query) + Firebase SDK\
**Type Safety:** Strict mode. No `any`. Every prop must have
interfaces.\
**File Naming:**\
- Components: PascalCase (`MyComponent.tsx`)\
- Hooks/utils: camelCase (`useAuth.ts`)\
**Imports:** Use absolute imports (`@/components/...`).

------------------------------------------------------------------------

## 2. Technology Stack & Packages

  Category   Technology                           Rationale
  ---------- ------------------------------------ ---------------------------------
  Core       React 18+, TypeScript, Vite          Standard modern stack
  Styling    Tailwind CSS, clsx, tailwind-merge   Utility class merging
  UI Kits    shadcn/ui, Radix UI                  Accessible base components
  Icons      Lucide React                         Lightweight icons
  Routing    React Router DOM v6+                 Client-side routing
  State      Zustand, TanStack Query              Clear separation of state types
  Forms      React Hook Form + Zod                Type-safe validation
  Editor     TipTap                               Rich text editing
  DnD        @dnd-kit/core                        Drag & drop for Kanban
  Backend    Firebase (Auth, Firestore)           Free tier + fast dev

------------------------------------------------------------------------

## 3. Directory Structure (Strict)

    src/
    ├── assets/
    ├── components/
    │   ├── ui/
    │   ├── layouts/
    │   ├── features/
    │   │   ├── schedule/
    │   │   ├── tasks/
    │   │   └── notes/
    │   └── shared/
    ├── hooks/
    ├── lib/
    ├── pages/
    ├── services/
    ├── store/
    ├── types/
    ├── App.tsx
    └── main.tsx

------------------------------------------------------------------------

## 4. Data Models & Schema (Source of Truth)

### A. User Profile (`types/user.ts`)

``` ts
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  university?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    startOfWeek: 'Mon' | 'Sun';
  };
}
```

------------------------------------------------------------------------

### B. Class Schedule (`types/schedule.ts`)

``` ts
export interface ClassSession {
  id: string;
  userId: string;
  subject: string;
  code: string;
  room?: string;
  instructor?: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  color: string;
}
```

------------------------------------------------------------------------

### C. Tasks (Kanban) (`types/task.ts`)

``` ts
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  relatedClassId?: string;
  createdAt: Date;
}
```

------------------------------------------------------------------------

### D. Notes (`types/note.ts`)

``` ts
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  lastEdited: Date;
}
```
