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

  // Parameter 'callback' implicitly has 'any' type
  start(callback) {
    this.server.listen(8080, callback);
  }

  // Parameter 'handler' implicitly has 'any' type
  onConnection(handler) {
    this.server.on('connection', handler);
  }

  // Parameter 'errorHandler' implicitly has 'any' type
  onError(errorHandler) {
    this.server.on('error', errorHandler);
  }
}