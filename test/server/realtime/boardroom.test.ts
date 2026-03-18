import { setupBoardroomSocket } from "../../../server/src/realtime/boardroom";
import { jest } from "@jest/globals";

describe("Boardroom Socket Namespace", () => {
  let connectionHandler: ((socket: any) => void) | null = null;

  function createHarness() {
    const roomEmitter = { emit: jest.fn() };
    const namespace = {
      on: jest.fn((event: string, cb: (socket: any) => void) => {
        if (event === "connection") connectionHandler = cb;
      }),
      to: jest.fn(() => roomEmitter),
      emit: jest.fn(),
    };
    const io = {
      of: jest.fn(() => namespace),
    };

    setupBoardroomSocket(io as any);
    return { namespace, roomEmitter };
  }

  it("should allow joining a valid session room", async () => {
    createHarness();
    const handlers: Record<string, (...args: any[]) => any> = {};
    const socket = {
      id: "socket-1",
      join: jest.fn(),
      emit: jest.fn(),
      on: jest.fn((event: string, cb: (...args: any[]) => any) => {
        handlers[event] = cb;
      }),
    };

    connectionHandler?.(socket);
    const sessionId = "123e4567-e89b-12d3-a456-426614174000";
    await handlers["join-session"](sessionId);

    expect(socket.join).toHaveBeenCalledWith(`session:${sessionId}`);
    expect(socket.emit).toHaveBeenCalledWith("joined", sessionId);
  });

  it("should reject invalid session IDs on join", async () => {
    createHarness();
    const handlers: Record<string, (...args: any[]) => any> = {};
    const socket = {
      id: "socket-2",
      join: jest.fn(),
      emit: jest.fn(),
      on: jest.fn((event: string, cb: (...args: any[]) => any) => {
        handlers[event] = cb;
      }),
    };

    connectionHandler?.(socket);
    await handlers["join-session"]("not-a-uuid");

    expect(socket.join).not.toHaveBeenCalled();
    expect(socket.emit).toHaveBeenCalledWith("error", { message: "Invalid session ID" });
  });
});
