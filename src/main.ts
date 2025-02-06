import * as config from "./config";
import { MarklinIO } from "./marklin/marklin_io";
import { MarklinController } from "./marklin/marklin_controller";
import { TrackDrift } from "./marklin/setup/track_drift";
import { TrackA } from "./marklin/setup/track_a";
import { ElectronApp } from "./electron_app";
import { ipcMain, IpcMainEvent } from "electron";
import { ITickPayload } from "./util/tick_payload";

const io = new MarklinIO();
io.listenTCP(config.SOCKET_PORT);

const controller = new MarklinController();

io.setController(controller);

// TrackDrift.setup(controller);
TrackA.setup(controller);

const eApp = new ElectronApp();
eApp.start();

const interval = 1000 / config.TICK_RATE;
setInterval(() => controller.tick(interval), interval);

ipcMain.on("getTickDelta", (e: IpcMainEvent) => {
  const payload: ITickPayload = controller.getTick(true);
  e.returnValue = JSON.stringify(payload);
});

ipcMain.on("getTickFull", (e: IpcMainEvent) => {
  const payload: ITickPayload = controller.getTick(false);
  e.returnValue = JSON.stringify(payload);
});
