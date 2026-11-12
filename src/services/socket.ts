import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
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
