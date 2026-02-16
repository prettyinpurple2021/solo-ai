const { io } = require("socket.io-client");
const socket = io("http://localhost:5000/boardroom");

socket.on("connect", () => {
  console.log("Connected to Boardroom namespace");
  socket.emit("join-session", "test-session");
});

socket.on("joined", (sessionId) => {
  console.log("Joined session:", sessionId);
  socket.emit("test-trigger-stream", { sessionId: "test-session", text: "Verified real-time streaming" });
});

socket.on("agent-chunk", (data) => {
  process.stdout.write(data.chunk);
  if (data.done) {
    process.stdout.write("\nStreaming complete.\n");
    socket.disconnect();
    process.exit(0);
  }
});

setTimeout(() => {
  console.log("Timed out waiting for socket events");
  process.exit(1);
}, 5000);
