"use client";

import { io, type Socket } from "socket.io-client";
import { API_BASE } from "./api-config";

let socket: Socket | null = null;
let activeToken: string | null = null;

function socketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? API_BASE;
}

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(accessToken: string): Socket {
  if (socket && activeToken === accessToken) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  activeToken = accessToken;
  socket = io(socketUrl(), {
    transports: ["websocket"],
    withCredentials: true,
    auth: {
      token: accessToken,
    },
  });

  return socket;
}

export function disconnectSocket(): void {
  activeToken = null;
  if (!socket) return;
  socket.disconnect();
  socket = null;
}
