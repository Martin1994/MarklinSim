import * as net from 'net';
import * as fs from 'fs';
import { MarklinController } from './marklin_controller';
import { MarklinDecoder } from './marklin_decoder';

export class MarklinIO {

    private readonly server: net.Server;
    private client: net.Socket = null;
    private controller: MarklinController = null;
    private decoder: MarklinDecoder = null;

    constructor() {
        this.server = net.createServer((socket: net.Socket) => {
            if (this.client) {
                socket.end();
                return;
            }

            this.client = socket;

            console.log('Client Connected.');

            socket.on('data', data => this.onData(data));

            socket.once('close', err => {
                socket.removeAllListeners();
                this.client = null;
            });
        });
    }

    public setController(controller: MarklinController) {
        this.controller = controller;
        this.decoder = new MarklinDecoder();
    }

    public listenTCP(port: number) {
        this.server.listen(port, () => {
            console.log(`MarklinSim is running on ${port}.`);
        });
    }

    public listenUnix(path: string) {
        fs.unlink(path, () => this.server.listen(path, () => {
            console.log(`MarklinSim is running on ${path}.`);
        }));
    }

    private onData(data: Buffer): void {
        for (const ch of data) {
            this.decoder.decode(this.controller, ch);
        }
    }
}
