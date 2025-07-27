import { WindowsTerminal } from "./windowsTerminal"
import type * as net from "net"
import type { jest } from "@jest/globals"

// Test runner types should now be available with @types/jest
describe("WindowsTerminal", () => {
  let terminal: WindowsTerminal

  beforeEach(() => {
    terminal = new WindowsTerminal()
  })

  // Add explicit type for done parameter
  it("should start successfully", (done: jest.DoneCallback) => {
    terminal.start(() => {
      done()
    })
  })

  // Add explicit types for done and socket parameters
  it("should handle connections", (done: jest.DoneCallback) => {
    terminal.onConnection((socket: net.Socket) => {
      expect(socket).toBeDefined()
      done()
    })
  })

  // Add explicit types for done and err parameters
  it("should handle errors", (done: jest.DoneCallback) => {
    terminal.onError((err: Error) => {
      expect(err).toBeDefined()
      done()
    })
  })
})
