import { MarklinController } from './marklin_controller';
import { SwitchDirection } from '../model/switch';

const CODE_BUFFER_EMPTY = -1;

export class MarklinDecoder {
    private codeBuffer: number = CODE_BUFFER_EMPTY;

    public decode(controller: MarklinController, code: number): void {
        if (this.codeBuffer === CODE_BUFFER_EMPTY) {
            this.decodeSingleCharCommand(controller, code);
        } else {
            this.decodeDoubleCharCommand(controller, this.codeBuffer, code);
            this.codeBuffer = CODE_BUFFER_EMPTY;
        }
    }

    public encodeSensor(sensors: boolean[]): Uint8Array {
        const encoded = new Uint8Array(Math.ceil(sensors.length / 8));
        for (let i = 0; i < sensors.length; i++) {
            if (sensors[i]) {
                encoded[Math.floor(i / 8)] |= 1 << (7 - i % 8);
            }
        }
        return encoded;
    }

    private decodeSingleCharCommand(controller: MarklinController, code: number): void {
        if (code < 35 && code !== 32) {
            this.codeBuffer = code;
        } else if (code === 133) {
            controller.requestSensorReporting();
        } else {
            this.codeBuffer = CODE_BUFFER_EMPTY;
        }
    }

    private decodeDoubleCharCommand(controller: MarklinController, code1: number, code2: number): void {
        if (this.codeBuffer < 32) {
            this.decodeTrainCommand(controller, code1, code2);
        } else if (this.codeBuffer < 35) {
            this.decodeSwitchCommand(controller, code1, code2);
        }
    }

    private decodeTrainCommand(controller: MarklinController, code1: number, code2: number): void {
        if ((code1 & 15) === 15) {
            controller.reverseTrain(code2);
        } else if (code1 !== 31) {
            controller.setTrainSpeed(code2, code1 & 15, !!(code1 & 16));
        } else {
            console.warn(`Invalid code ${code2}.`);
        }
    }

    private decodeSwitchCommand(controller: MarklinController, code1: number, code2: number): void {
        if (code1 === 33) {
            controller.changeSwitchDirection(code2, SwitchDirection.Straight);
        } else {
            controller.changeSwitchDirection(code2, SwitchDirection.Curve);
        }
    }
}
