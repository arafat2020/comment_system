# Frontend - Premium Real-Time UI

A high-fidelity client built with React 19, focusing on visual excellence and zero-latency user interactions.

## 🛠 Features Implemented

### 1. Premium "Twitter Dim" Theme
- **SCSS Design System**: Centralized variables (`_variables.scss`) with nested rules for maximum maintainability.
- **Visual Harmony**: Softer dark palette (`#15202b`) and refined icon button states.
- **Responsive Layout**: Fluid sidebar and feed system with specific mobile optimizations.

### 2. Advanced State & Real-time
- **Optimistic UI (React 19)**: Implements `useOptimistic` in `PostItem`, `CommentItem`, `HomePage`, and `ProfilePage`. This ensures that likes, dislikes, edits, and deletions are reflected instantly in the UI before server confirmation, significantly improving the perceived speed of the application.
- **Concurrent Actions**: Integrated with `startTransition` to handle state updates alongside asynchronous API calls, ensuring a fluid, "glitch-free" experience.

### 3. Modular Custom Hooks
- `useAuth`: A specialized hook for managing user identity, token persistence, and authentication states, isolated to support Vite HMR.
- `useWebSocket`: A low-level hook for managing raw Socket.io connections and reconnection logic.
- `useWebSocketRoom`: A high-level hook for joining specific rooms (standardized `post_{id}` or `feed`) and handling incoming events with type-safe callbacks.
- `useFetch`: A robust data fetching hook with support for generic types, loading states, and error handling.

### 4. Reliable Architecture
- **HMR Excellence**: Refactored to solve Fast Refresh errors by isolating hooks from context definitions into separate `AuthContextType` and `WebSocketContextType` files.
- **Type-Safe Actions**: Centralized `OptimisticAction` union types in `src/types/index.ts` to ensure that every optimistic transition has a predictable and typed payload.

### 5. Specialized Modules
- **Modular Edit UI**: A sophisticated in-place comment editor in `CommentItem.tsx` that uses auto-expanding textareas and blends seamlessly with the dark theme.
- **Real-time Navigation**: Sidebar with active link detection and user identity integration.

## 🎨 Styles
- `App.scss`: Main application layout and component specific overrides.
- `styles/_variables.scss`: The core design tokens (colors, spacing, transitions).

## 🚀 Commands
- `npm run dev`: Start Vite dev server.
- `npm run build`: Production build with TypeScript verification.
- `npm run lint`: Strict architectural and style linting.
