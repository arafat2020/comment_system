import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { json, urlencoded } from 'express';
import path from 'path';
import http from 'http';
import authRoutes from './modules/auth/auth.routes';
import postsRoutes from './modules/posts/posts.routes';
import commentsRoutes from './modules/comments/comments.routes';
import fs from 'fs';
import { webSocketService } from './services/websocket.service';


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(json());
app.use(urlencoded({ extended: true }));

// Database Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/comment_system');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        process.exit(1);
    }
};


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start Server
const start = async () => {
    await connectDB();

    // Initialize WebSockets
    webSocketService.init(server);

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start();
