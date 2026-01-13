import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface WebSocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
    sendMessage: (type: string, data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<any>(null);

    const connect = () => {
        const ws = new WebSocket('ws://localhost:5000');

        ws.onopen = () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket');
            setIsConnected(false);
            setSocket(null);

            // Reconnect logic
            reconnectTimeoutRef.current = setTimeout(() => {
                console.log('Attempting to reconnect...');
                connect();
            }, 3000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            ws.close();
        };

        setSocket(ws);
    };

    useEffect(() => {
        connect();
        return () => {
            if (socket) {
                socket.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    const sendMessage = (type: string, data: any) => {
        if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type, data }));
        } else {
            console.warn('WebSocket not ready to send. State:', socket?.readyState);
        }
    };

    return (
        <WebSocketContext.Provider value={{ socket, isConnected, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
