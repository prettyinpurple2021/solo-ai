import { createServer } from "http";
import { Server } from "socket.io";
import { io as Client, Socket as ClientSocket } from "socket.io-client";
import { setIo } from "../../../server/realtime";
import { setupBoardroomSocket } from "../../../server/src/realtime/boardroom";

describe("Boardroom Socket Namespace", () => {
  let io: Server, clientSocket: ClientSocket;
  let port: number;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer, {
      wsEngine: require("ws").Server
    });
    setIo(io as any);
    
    setupBoardroomSocket(io as any);

    httpServer.listen(() => {
      const address = httpServer.address();
      port = typeof address === "string" ? 0 : address?.port || 0;
      clientSocket = Client(`http://localhost:${port}/boardroom`);
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    if (io) io.close();
    if (clientSocket) clientSocket.disconnect();
  });

  it("should allow joining a session room", (done) => {
    clientSocket.emit("join-session", "session-123");
    clientSocket.on("joined", (sessionId) => {
      expect(sessionId).toBe("session-123");
      done();
    });
  });

  it("should handle streaming agent responses", (done) => {
    const chunks: string[] = [];
    clientSocket.on("agent-chunk", (data) => {
      chunks.push(data.chunk);
      if (data.done) {
        expect(chunks.join("")).toBe("Hello world");
        done();
      }
    });

    // We'll trigger a mock streaming event from the server side in the implementation
    clientSocket.emit("test-trigger-stream", { sessionId: "session-123", text: "Hello world" });
  });
});
