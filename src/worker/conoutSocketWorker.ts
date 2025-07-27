import { parentPort } from 'worker_threads';
import * as net from 'net';

// Parameter 'workerSocket' implicitly has 'any' type
function handleConnection(workerSocket) {
  // This would cause TypeScript error: Cannot find name 'console'
  console.log('Worker handling connection');
  
  // Parameter 'data' implicitly has 'any' type
  workerSocket.on('data', (data) => {
    parentPort?.postMessage({ type: 'data', payload: data.toString() });
  });

  // Parameter 'err' implicitly has 'any' type
  workerSocket.on('error', (err) => {
    console.error('Socket error:', err);
  });
}

// Parameter 'message' implicitly has 'any' type
parentPort?.on('message', (message) => {
  if (message.type === 'connect') {
    const socket = net.connect(message.port, message.host);
    handleConnection(socket);
  }
});