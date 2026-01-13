import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketContext } from './WebSocketContextType';

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const connectRef = useRef<() => void>(() => { });

    const connect = useCallback(() => {
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
                // We use connectRef to call the latest version of connect without creating a circular dependency
                if (connectRef.current) connectRef.current();
            }, 3000);
        };

        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
            ws.close();
        };

        setSocket(ws);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        connectRef.current = connect;
    }, [connect]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            connect();
        }, 0);
        return () => {
            clearTimeout(timeoutId);
            if (socket) {
                socket.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]); // removed socket dependency to avoid infinite loops if setSocket triggers it

    const sendMessage = useCallback((type: string, data: unknown) => {
        if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type, data }));
        } else {
            console.warn('WebSocket not ready to send. State:', socket?.readyState);
        }
    }, [socket, isConnected]);

    return (
        <WebSocketContext.Provider value={{ socket, isConnected, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};
