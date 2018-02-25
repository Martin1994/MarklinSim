import { MarklinController } from './marklin_controller';

export class MarklinDecoder {
    private codeBuffer: number = -1;

    public decode(controller: MarklinController, code: number): void {
        if (this.codeBuffer < 0) {
            this.decodeSingleCommand(controller, code);
        } else if (this.codeBuffer < 32) {
            this.decodeTrainCommand(controller, this.codeBuffer, code);
            this.codeBuffer = -1;
        } else if (this.codeBuffer < 35) {
            this.decodeSwitchCommand(controller, this.codeBuffer, code);
            this.codeBuffer = -1;
        }
    }

    private decodeSingleCommand(controller: MarklinController, code: number): void {
        if (code < 35 && code !== 32) {
            this.codeBuffer = code;
        } else {
            this.codeBuffer = -1;
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

    }
}
