import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';

export class ElectronApp {
    private win: BrowserWindow;

    public start() {
        app.on('ready', () => this.createWindow());

        app.on('window-all-closed', () => {
            app.quit();
        });
    }

    private createWindow() {
        this.win = new BrowserWindow({width: 825, height: 650});

        this.win.loadURL(url.format({
            pathname: path.join(__dirname, 'view', 'index.html'),
            protocol: 'file:',
            slashes: true
        }));

        this.win.on('closed', () => {
            this.win = null;
        });
    }
}
