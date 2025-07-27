import { parentPort } from 'worker_threads';
import * as net from 'net';

// Add explicit type for workerSocket parameter
function handleConnection(workerSocket: net.Socket) {
  // This would cause TypeScript error: Cannot find name 'console'
  console.log('Worker handling connection');
  
  // Add explicit type for data parameter
  workerSocket.on('data', (data: Buffer) => {
    parentPort?.postMessage({ type: 'data', payload: data.toString() });
  });

  // Add explicit type for err parameter
  workerSocket.on('error', (err: Error) => {
    console.error('Socket error:', err);
  });
}

// Add explicit type for message parameter
parentPort?.on('message', (message: { type: string; port?: number; host?: string }) => {
  if (message.type === 'connect') {
    const socket = net.connect(message.port!, message.host!);
    handleConnection(socket);
  }
});
