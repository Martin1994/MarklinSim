import * as config from '../config';

export class Sensor {
    public readonly id: number;
    public readonly name: string;
    public readonly distanceToHead: number;
    public readonly forward: boolean;
    public readonly width: number = config.SENSOR_TRIGGER_WIDTH;

    public constructor(id: number, name: string, distanceToHead: number, forward: boolean) {
        this.id = id;
        this.name = name;
        this.distanceToHead = distanceToHead;
        this.forward = forward;
    }
}
