import { createContext } from 'react';

interface WebSocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
    sendMessage: (type: string, data: unknown) => void;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);
