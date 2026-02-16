import { Server as SocketServer } from "socket.io";
import { logInfo } from "../../utils/logger";

export function setupBoardroomSocket(io: SocketServer) {
  const boardroomNamespace = io.of("/boardroom");

  boardroomNamespace.on("connection", (socket) => {
    logInfo("Client connected to Boardroom namespace", { socketId: socket.id });

    socket.on("join-session", (sessionId: string) => {
      socket.join(`session:${sessionId}`);
      logInfo(`Client joined boardroom session: ${sessionId}`, { socketId: socket.id });
      socket.emit("joined", sessionId);
    });

    socket.on("disconnect", () => {
      logInfo("Client disconnected from Boardroom namespace", { socketId: socket.id });
    });
  });

  return boardroomNamespace;
}
