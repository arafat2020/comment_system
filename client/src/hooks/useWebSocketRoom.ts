import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

/**
 * Custom hook to handle WebSocket room joining and message listening
 * @param roomId - The ID of the room to join (e.g., postId)
 * @param onMessage - Callback for when a message is received
 */
export const useWebSocketRoom = (
    roomId: string,
    onMessage: (type: string, data: unknown) => void
) => {
    const { socket, isConnected, sendMessage } = useWebSocket();

    useEffect(() => {
        if (isConnected && roomId) {
            sendMessage('join_room', { roomId });
        }
    }, [roomId, isConnected, sendMessage]);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event: MessageEvent) => {
            try {
                const { type, data } = JSON.parse(event.data);
                onMessage(type, data);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        socket.addEventListener('message', handleMessage);
        return () => socket.removeEventListener('message', handleMessage);
    }, [socket, onMessage]);

    return {
        socket,
        isConnected
    };
};

export default useWebSocketRoom;
