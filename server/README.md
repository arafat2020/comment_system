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
- `npm run build`: Compile TypeScript to JavaScript in `dist/`.

## 🐳 Deployment & Docker

The server is fully containerized for production consistency.

### 1. Simple Docker Run
To build and start the server along with persistent volumes for uploads:
```bash
docker compose up --build
```

### 2. Volume Management
The `compose.yaml` is configured with a named volume `uploads` to ensure that user profile pictures and post images persist even if the container is destroyed or updated.
- **Container Path**: `/usr/src/app/uploads`
- **Host Storage**: Managed by Docker volumes.

### 3. Environment Setup
Ensure you have a `.env` file in the `server` directory. You can use `.env.example` as a template.
- `PORT`: The internal server port (default 5000).
- `MONGO_URI`: Connection string for your MongoDB instance.
- `JWT_SECRET`: Secret key for token signing.
