import { io, type Socket } from 'socket.io-client';
import { getStoredToken } from './token';

const SOCKET_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(
  /\/api\/?$/,
  '',
);

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  const token = getStoredToken();
  if (!token) return null;

  if (socket?.connected) return socket;

  if (!socket) {
    socket = io(SOCKET_URL, { auth: { token } });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
