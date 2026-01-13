# Backend - Real-Time API Service

The backend is a robust Express service optimized for real-time interactions and data integrity.

## 🛠 Features Implemented

### 1. Real-Time WebSocket Engine
- **Standardized Broadcasting**: Uses a room-based architecture (e.g., `post_{postId}`) to ensure efficient messaging.
- **Event Lifecycle**: Implements `new_post`, `update_post`, `delete_post`, and corresponding comment events.

### 2. Sophisticated Reaction Logic
- **Mutually Exclusive Dislikes**: Logic in `CommentsService` and `PostsService` ensures a user cannot like and dislike the same item simultaneously.
- **Atomic Population**: Every reaction toggle performs a full metadata population before returning to avoid UI inconsistencies.

### 3. High-Performance Pagination
- **Skip/Limit Strategy**: Optimized MongoDB queries with pagination metadata (total pages, current page).
- **Relational Depth**: Carefully manages population of `author`, `likes`, and `dislikes` to balance performance and data availability.

### 4. Auth & Security
- **JWT Middleware**: Secure route protection with custom `req.user` attachment.
- **Safe Passwords**: BCrypt integration for user data protection.

## 📁 Directory Structure
- `src/modules`: Domain-driven architecture (auth, posts, comments).
- `src/services`: Shared services like the centralized `webSocketService`.
- `src/middlewares`: Security and error handling layers.

## 🚀 Commands
- `npm run dev`: Start dev server with nodemon.
- `npm run lint`: Run linting checks.
