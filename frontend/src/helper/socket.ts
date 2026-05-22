import { io, Socket } from 'socket.io-client';
import { SOCKET_PROD } from './APIUtils';

let socket: Socket | null = null;
let currentAuthToken: string | null = null;

/**
 * Initialize Socket.IO connection with optional authentication
 * @param {string|null} token - JWT authentication token (optional)
 * @returns {Socket} Socket instance
 */
export const initializeSocket = (token: string | null = null): Socket => {
    const tokenChanged = currentAuthToken !== token;

    if (socket && !tokenChanged) {
        return socket;
    }

    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
    }

    currentAuthToken = token;

    const socketOptions: any = {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 20000,
        transports: ['websocket'], // Often preferred for React Native to avoid long-polling issues
    };

    // Add authentication if token is provided
    if (token) {
        socketOptions.auth = {
            token: token
        };
    }

    // Initialize socket connection
    socket = io(SOCKET_PROD, socketOptions);

    // Connection event handlers
    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket?.id);
    });

    socket.on('disconnect', (reason: string) => {
        console.log('❌ Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
            // Server forcefully disconnected, reconnect manually
            socket?.connect();
        }
    });

    socket.on('connect_error', (error: Error) => {
        console.error('⚠️ Socket connection error:', error.message);
    });

    socket.on('reconnect', (attemptNumber: number) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', (attemptNumber: number) => {
        console.log('🔄 Reconnection attempt:', attemptNumber);
    });

    socket.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed');
    });

    return socket;
};

/**
 * Get current socket instance
 * @returns {Socket|null} Current socket instance or null
 */
export const getSocket = (): Socket | null => socket;

/**
 * Disconnect and cleanup socket
 */
export const disconnectSocket = (): void => {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }

    currentAuthToken = null;
};

/**
 * Check if socket is connected
 * @returns {boolean} Connection status
 */
export const isSocketConnected = (): boolean => {
    return socket ? socket.connected : false;
};
