import { ipcRenderer } from 'electron';
import { ITickPayload } from '../util/tick_payload';
import { View } from './view';

const view = new View();

function tick() {
    const payload: ITickPayload = JSON.parse(ipcRenderer.sendSync('getTickDelta'));
    view.render(payload);
    window.requestAnimationFrame(tick);
}

document.addEventListener('readystatechange', (e) => {
    if (document.readyState === 'complete') {
        view.install();
        const payload: ITickPayload = JSON.parse(ipcRenderer.sendSync('getTickFull'));
        view.render(payload);
        window.requestAnimationFrame(tick);
    }
});
