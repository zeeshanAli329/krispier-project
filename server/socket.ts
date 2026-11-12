import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export function initSocketIO(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // Client can join a specific room (e.g. 'role:admin', 'role:cook', 'role:waiter', 'role:delivery', 'table:T01')
    socket.on('join_room', (room: string) => {
      socket.join(room);
    });

    socket.on('leave_room', (room: string) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastEvent(event: string, data: any) {
  if (!io) return;
  io.emit(event, data);
}

export function broadcastToRoom(room: string, event: string, data: any) {
  if (!io) return;
  io.to(room).emit(event, data);
}
