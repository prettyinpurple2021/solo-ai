import { Server as SocketServer } from "socket.io";
import { logInfo, logError, caughtToError } from "../../utils/logger";
import { BoardroomEventSchema, BlackboardUpdateSchema } from "@/shared/schemas";
import { BlackboardManager } from "../services/boardroom/blackboard";
import { z } from "zod";

const blackboard = new BlackboardManager();

export function setupBoardroomSocket(io: SocketServer) {
  const boardroomNamespace = io.of("/boardroom");

  boardroomNamespace.on("connection", (socket) => {
    logInfo("Client connected to Boardroom Real-time Hub", { socketId: socket.id });

    socket.on("join-session", async (sessionId: string) => {
      try {
        const validatedId = z.string().uuid().parse(sessionId);
        socket.join(`session:${validatedId}`);
        logInfo(`Client joined boardroom session: ${validatedId}`, { socketId: socket.id });
        
        // Send current state to newly joined client
        const currentState = await blackboard.getState(validatedId);
        socket.emit("session-state", currentState || { sessionId: validatedId, content: {}, version: 0 });
        
        socket.emit("joined", validatedId);
      } catch (error) {
        logError("Failed to join boardroom session", caughtToError(error), {
          sessionId,
        });
        socket.emit("error", { message: "Invalid session ID" });
      }
    });

    // Validated state update from agent or user
    socket.on("update-state", async (data: any) => {
      try {
        const validated = BlackboardUpdateSchema.parse(data);
        const { sessionId, updates, agentId } = validated;

        const newState = await blackboard.updateState(sessionId, updates, agentId);
        
        // Broadcast new state to all participants in the session
        boardroomNamespace.to(`session:${sessionId}`).emit("state-updated", newState);
      } catch (error) {
        logError("Blackboard state update failed", caughtToError(error), {
          dataSummary: typeof data === "object" ? JSON.stringify(data).slice(0, 500) : String(data),
        });
        socket.emit("error", { message: "Failed to update collaborative state" });
      }
    });

    socket.on("boardroom-event", (data: any) => {
      try {
        const validatedEvent = BoardroomEventSchema.parse(data);
        logInfo("Validated boardroom event received", { type: validatedEvent.type });
        
        const sessionId = (data as any).sessionId;
        if (sessionId) {
          boardroomNamespace.to(`session:${sessionId}`).emit("event", validatedEvent);
        } else {
          boardroomNamespace.emit("event", validatedEvent);
        }
      } catch (error) {
        logError("Invalid boardroom event received", caughtToError(error), {
          dataSummary: typeof data === "object" ? JSON.stringify(data).slice(0, 500) : String(data),
        });
        socket.emit("error", { message: "Invalid event format" });
      }
    });

    socket.on("disconnect", () => {
      logInfo("Client disconnected from Boardroom Real-time Hub", { socketId: socket.id });
    });
  });

  return boardroomNamespace;
}
