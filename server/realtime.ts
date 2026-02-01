import type { Server as SocketServer } from 'socket.io'
import { logWarn } from './utils/logger'

let ioInstance: SocketServer | null = null

export function setIo(io: SocketServer) {
  ioInstance = io
}

export function getIo(): SocketServer | null {
  return ioInstance
}

export function broadcastToUser(userId: string, event: string, data: any) {
  if (!ioInstance) {
    logWarn('Socket.io instance not initialized; cannot broadcast', { event, userId })
    return
  }
  ioInstance.to(`user:${userId}`).emit(event, data)
  return
}

