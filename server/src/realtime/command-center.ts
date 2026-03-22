
import { Server as SocketServer } from "socket.io";
import { logInfo, logError, caughtToError } from "../../utils/logger";
import { z } from "zod";

/**
 * Command Center Socket Handler
 * Responsible for real-time HUD updates, global activity, and predictive notifications
 */
export function setupCommandCenterSocket(io: SocketServer) {
  const commandCenterNamespace = io.of("/command-center");

  commandCenterNamespace.on("connection", (socket) => {
    logInfo("Client connected to Command Center HUD", { socketId: socket.id });

    // Join a private user-specific channel for secure HUD updates
    socket.on("sync-hud", (userId: string) => {
      try {
        const validatedUserId = z.string().min(1).parse(userId);
        socket.join(`user:${validatedUserId}`);
        logInfo(`User synchronized with HUD Command: ${validatedUserId}`, { socketId: socket.id });
        
        // Initial sync of real-time state
        socket.emit("hud-ready", {
          timestamp: new Date().toISOString(),
          status: "connected",
          activeAgents: []
        });
      } catch (error) {
        logError("HUD sync failed", caughtToError(error), { userId });
        socket.emit("error", { message: "Failed to sync HUD state" });
      }
    });

    // Handle global system events (broadcast to all)
    socket.on("system-ping", () => {
      socket.emit("system-pong", { timestamp: new Date().toISOString() });
    });

    socket.on("disconnect", () => {
      logInfo("Client disconnected from Command Center HUD", { socketId: socket.id });
    });
  });

  return commandCenterNamespace;
}

/**
 * Helper to broadcast revenue updates to a specific user
 */
export function broadcastRevenueUpdate(io: SocketServer, userId: string, data: any) {
  io.of("/command-center").to(`user:${userId}`).emit("revenue-update", data);
}

/**
 * Helper to broadcast real-time agent activity
 */
export function broadcastAgentActivity(io: SocketServer, userId: string, data: any) {
  io.of("/command-center").to(`user:${userId}`).emit("agent-activity", data);
}
