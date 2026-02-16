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

    // Mock streaming logic for testing/prototyping
    socket.on("test-trigger-stream", async (data: { sessionId: string, text: string }) => {
      const words = data.text.split(" ");
      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i === words.length - 1 ? "" : " ");
        boardroomNamespace.to(`session:${data.sessionId}`).emit("agent-chunk", {
          sessionId: data.sessionId,
          chunk,
          done: i === words.length - 1
        });
        // Small delay to simulate network/AI processing
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });

    socket.on("disconnect", () => {
      logInfo("Client disconnected from Boardroom namespace", { socketId: socket.id });
    });
  });

  return boardroomNamespace;
}
