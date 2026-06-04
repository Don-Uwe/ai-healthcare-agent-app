import React, { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';

import { useSelector } from 'react-redux';
import { Socket } from 'socket.io-client';
import { initializeSocket, disconnectSocket } from '../helper/socket';


interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }: SocketProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Get token and user info from Redux
    const { user_token, user_id } = useSelector((state: any) => state.user);

    // Track the token that this provider instance initialized with.
    // This lets us disconnect safely on unmount/auth removal without thrashing the singleton.
    const tokenInitializedRef = useRef<string | null>(null);
    const latestTokenRef = useRef<string | null>(user_token);
    latestTokenRef.current = user_token;

    useEffect(() => {
        // Only initialize if we have a valid token
        if (!user_token) {
            if (__DEV__) console.log('Socket Context: No valid token present, skipping connection');
            // Authentication removed: ensure we tear down the singleton.
            disconnectSocket();
            setSocket(null);
            setIsConnected(false);
            tokenInitializedRef.current = null;
            return;
        }

        // Initialize socket with authentication token.
        const socketInstance = initializeSocket(user_token);
        tokenInitializedRef.current = user_token;
        setSocket(socketInstance);

        // Connection listeners
        const onConnect = () => {
            setIsConnected(true);
            if (__DEV__) console.log('Socket Context: Connected');
            
            // Auto-join user room for notifications if logged in
            if (user_id) {
                socketInstance.emit('join-user-notifications', { userId: user_id });
            }
        };

        const onDisconnect = () => {
            setIsConnected(false);
            if (__DEV__) console.log('Socket Context: Disconnected');
        };

        socketInstance.on('connect', onConnect);
        socketInstance.on('disconnect', onDisconnect);

        return () => {
            socketInstance.off('connect', onConnect);
            socketInstance.off('disconnect', onDisconnect);
            setIsConnected(false);
        };
    }, [user_token]); // Re-initialize only when token changes

    // Provider unmount cleanup: disconnect only if the current auth matches what this provider initialized.
    useEffect(() => {
        return () => {
            if (tokenInitializedRef.current && latestTokenRef.current === tokenInitializedRef.current) {
                disconnectSocket();
            }
        };
    }, []);



    useEffect(() => {
        if (!socket || !user_id) return;

        // Ensure we never accumulate duplicate listeners.
        const joinUserNotifications = () => {
            socket.emit('join-user-notifications', { userId: user_id });
        };

        // Emit once immediately for the current socket.
        joinUserNotifications();

        // Defensive: remove then re-add.
        socket.off('connect', joinUserNotifications);
        socket.on('connect', joinUserNotifications);

        return () => {
            socket.off('connect', joinUserNotifications);
        };
    }, [socket, user_id]);


    const value = useMemo(
        () => ({
            socket,
            isConnected,
        }),
        [socket, isConnected],
    );


    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

/**
 * Hook to access socket instance
 * @returns {Socket | null} Socket instance
 */
export const useSocket = () => {
    const context = useContext(SocketContext);

    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context.socket;
};

/**
 * Hook to check socket connection status
 * @returns {boolean} Connection status
 */
export const useSocketConnection = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocketConnection must be used within SocketProvider');
    }
    return context.isConnected;
};
