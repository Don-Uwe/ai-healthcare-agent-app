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

    // Connection event handlers (keep side-effects minimal; avoid noisy console logs)
    socket.on('disconnect', (reason: string) => {
        if (reason === 'io server disconnect') {
            // Server forcefully disconnected, reconnect manually
            socket?.connect();
        }
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
