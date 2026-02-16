const { io } = require("socket.io-client");
const socket = io("http://localhost:5000/boardroom");

let testedConclusion = false;

socket.on("connect", () => {
  console.log("Connected to Boardroom namespace");
  socket.emit("join-session", "test-session");
});

socket.on("joined", (sessionId) => {
  console.log("Joined session:", sessionId);
  console.log("\nTesting Directed Interjection (Targeting echo)...");
  socket.emit("test-trigger-stream", { 
    sessionId: "test-session", 
    text: "Understood. I will address this with Echo.",
    targetAgentId: "echo"
  });
});

socket.on("agent-chunk", (data) => {
  process.stdout.write(data.chunk);
  if (data.done) {
    process.stdout.write("\nStreaming complete.\n");
    
    if (!testedConclusion) {
        testedConclusion = true;
        console.log("\nTesting Conclusion...");
        socket.emit("test-trigger-stream", { 
            sessionId: "test-session", 
            text: "The board meeting is now adjourned." 
        });
    } else {
        socket.disconnect();
        process.exit(0);
    }
  }
});

setTimeout(() => {
  console.log("Timed out waiting for socket events");
  process.exit(1);
}, 10000);
