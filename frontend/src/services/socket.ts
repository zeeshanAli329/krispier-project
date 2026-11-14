import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '')).replace(/\/$/, '');

export function getSocket(): Socket {
  if (!socket) {
    if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL must be configured for Socket.IO.');
    socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      // console.log('Connected to KRISPIER real-time updates');
    });
  }
  return socket;
}

export function subscribeToEvent<T = any>(event: string, callback: (data: T) => void): () => void {
  const s = getSocket();
  s.on(event, callback);
  return () => {
    s.off(event, callback);
  };
}
