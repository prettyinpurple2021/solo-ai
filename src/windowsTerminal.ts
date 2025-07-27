import * as net from 'net';
import { Worker } from 'worker_threads';

export class WindowsTerminal {
  private server: net.Server;
  private worker: Worker;

  constructor() {
    this.server = net.createServer();
    this.worker = new Worker('./worker/conoutSocketWorker.js');
    
    // This would cause TypeScript error: Cannot find name 'process'
    console.log('Terminal initialized on process:', process.pid);
  }

  // Add explicit type for callback parameter
  start(callback: () => void) {
    this.server.listen(8080, callback);
  }

  // Add explicit type for handler parameter
  onConnection(handler: (socket: net.Socket) => void) {
    this.server.on('connection', handler);
  }

  // Add explicit type for errorHandler parameter
  onError(errorHandler: (err: Error) => void) {
    this.server.on('error', errorHandler);
  }
}
