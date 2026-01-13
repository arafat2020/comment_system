import { Server, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

export class WebSocketService {
    private static instance: WebSocketService;
    private wss: Server | null = null;
    private rooms: Map<string, Set<WebSocket>> = new Map();

    private constructor() { }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    public init(server: HttpServer): void {
        this.wss = new Server({ server });

        this.wss.on('connection', (ws: WebSocket) => {
            console.log('Client connected to WebSocket');

            ws.on('message', (message: string) => {
                try {
                    const parsed = JSON.parse(message);
                    const { type } = parsed;
                    const roomId = parsed.roomId || (parsed.data && parsed.data.roomId);

                    if (type === 'join_room' && roomId) {
                        this.joinRoom(roomId, ws);
                    }
                } catch (e) {
                    // Ignore non-json messages
                }
            });

            ws.on('close', () => {
                this.removeFromAllRooms(ws);
                console.log('Client disconnected from WebSocket');
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });
        });

        console.log('WebSocket Server initialized');
    }

    private joinRoom(roomId: string, ws: WebSocket): void {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId)!.add(ws);
        console.log(`Client joined room: ${roomId}`);
    }

    private removeFromAllRooms(ws: WebSocket): void {
        this.rooms.forEach((clients, roomId) => {
            if (clients.has(ws)) {
                clients.delete(ws);
                if (clients.size === 0) {
                    this.rooms.delete(roomId);
                }
            }
        });
    }

    public broadcast(type: string, data: any, roomId?: string): void {
        const message = JSON.stringify({ type, data });

        if (roomId && this.rooms.has(roomId)) {
            // Targeted broadcast to a room
            this.rooms.get(roomId)!.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } else if (!roomId && this.wss) {
            // Global broadcast
            this.wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    }
}

export const webSocketService = WebSocketService.getInstance();
