import { spawn } from 'child_process';
import { io } from 'socket.io-client';
import path from 'path';

async function main() {
    console.log('🧪 Starting WebSocket Verification...');

    // 1. Start the backend server
    const serverPath = path.join(process.cwd(), 'server', 'index.ts');
    console.log(`🚀 Starting server from: ${serverPath}`);

    const serverProcess = spawn('npx', ['tsx', serverPath], {
        cwd: process.cwd(),
        env: {
            ...process.env,
            PORT: '3001',
            ...(process.env.STRIPE_SECRET_KEY
                ? { STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY }
                : {}),
        },
        stdio: 'pipe',
        shell: true
    });

    let serverStarted = false;

    serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Server]: ${output.trim()}`);
        if (output.includes('Server running on')) {
            serverStarted = true;
            connectClient();
        }
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`[Server Error]: ${data.toString()}`);
    });

    // 2. Connect Client
    function connectClient() {
        console.log('🔌 Connecting Socket.io client...');
        const socket = io('http://localhost:3001', {
            transports: ['websocket'],
            reconnection: false
        });

        socket.on('connect', () => {
            console.log('✅ Client Connected Successfully!');
            cleanup(0);
        });

        socket.on('connect_error', (err) => {
            console.error('❌ Connection Error:', err.message);
            cleanup(1);
        });

        // Timeout if not connected in 10s
        setTimeout(() => {
            console.error('❌ Connection Timeout');
            cleanup(1);
        }, 10000);

        function cleanup(code: number) {
            socket.disconnect();
            serverProcess.kill();
            // Force kill if needed
            try { process.kill(serverProcess.pid!); } catch (e) { }
            process.exit(code);
        }
    }
}

main();
