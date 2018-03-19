import * as config from '../config';
import { Track } from './track';
import { IPoint2D } from '../util/point2d';

/**
 * The train model. It can move, accelerate, and turns on and off its light.
 *
 * It has one active wheel and one passive wheel. See move method for detail.
 */
export class Train {
    public readonly id: number;
    public targetSpeed: number = 0;
    public currentSpeed: number = 0;
    public reversed: boolean = false;
    public light: boolean = false;
    public lightDirty: boolean = false;
    public readonly accelerateInterval: number = config.TRAIN_ACCELERATE_INTERVAL;
    public readonly speedMultiplier: number = config.TRAIN_SPEED_MULTIPLIER;
    public nextAccelerate: number = 0;
    public readonly length = config.TRAIN_LENGTH;
    public readonly width = config.TRAIN_WIDTH;
    public readonly wheelOffset = config.TRAIN_WHEEL_OFFSET;
    public readonly frontWheel: IWheel = {
        track: null,
        distance: 0,
        forward: true,
        globalPosition: null
    };
    public readonly backWheel: IWheel = {
        track: null,
        distance: 0,
        forward: true,
        globalPosition: null
    };
    public positionDirty: boolean = false;

    public constructor(id: number) {
        this.id = id;
    }

    /**
     * Put this train on a track. The active wheel will be on the centre of the track.
     * Make sure the track is long enough to put the back wheel.
     *
     * @param track The track to put on.
     * @param forward Whether facing forward.
     */
    public putOnTrack(track: Track, forward: boolean) {
        this.frontWheel.track = track;
        this.frontWheel.distance = track.getLength() / 2;
        this.frontWheel.forward = forward;
        this.frontWheel.globalPosition = track.getGlobalPosition(this.frontWheel.distance);
        this.backWheel.track = track;
        this.backWheel.distance = track.getLength() / 2 + (forward ? -1 : 1) * (this.length - 2 * this.wheelOffset);
        this.backWheel.forward = forward;
        this.backWheel.globalPosition = track.getGlobalPosition(this.backWheel.distance);
    }

    /**
     * Accelerate the train.
     *
     * @param interval The time interval.
     */
    public accelerate(interval: number) {
        if (this.targetSpeed !== this.currentSpeed) {
            this.nextAccelerate -= interval;
            while (this.nextAccelerate < 0 && this.targetSpeed !== this.currentSpeed) {
                if (this.targetSpeed > this.currentSpeed) {
                    this.currentSpeed++;
                } else {
                    this.currentSpeed--;
                }
                if (this.targetSpeed === this.currentSpeed) {
                    this.nextAccelerate = 0;
                } else {
                    this.nextAccelerate += this.accelerateInterval;
                }
            }
        }
    }

    /**
     * Move the train along the track. The active wheel will move excately at the train's speed, while
     * the passive wheel will keep be dragged by the active wheel.
     *
     * @param interval The time interval.
     */
    public move(interval: number) {
        if (this.currentSpeed !== 0) {
            const displacement = this.currentSpeed * this.speedMultiplier * interval / 1000;

            const wheel = this.frontWheel;
            const passiveWheel = this.backWheel;

            const target = wheel.track.move(wheel.distance, displacement, wheel.forward);
            wheel.track = target.track;
            wheel.distance = target.distance;
            wheel.forward = target.forward;
            wheel.globalPosition = target.globalPosition;

            const passiveTarget = passiveWheel.track.movePassive(
                passiveWheel.distance, wheel.globalPosition, this.length - 2 * this.wheelOffset);
            if (!passiveTarget) {
                const passiveTarget2 = passiveWheel.track.movePassive(
                    passiveWheel.distance, wheel.globalPosition, this.length - 2 * this.wheelOffset);
            }
            passiveWheel.track = passiveTarget.track;
            passiveWheel.distance = passiveTarget.distance;
            passiveWheel.forward = passiveTarget.forward;
            passiveWheel.globalPosition = passiveTarget.globalPosition;
            this.positionDirty = true;
        }
    }

    public reverse() {
        this.reversed = !this.reversed;
        this.frontWheel.forward = !this.frontWheel.forward;
        this.backWheel.forward = !this.backWheel.forward;
        this.currentSpeed = 0;
        this.targetSpeed = 0;
    }

    public serialize(delta: boolean): ITrain {
        const serialized: ITrain = {
            id: this.id,
            reversed: this.reversed,
            light: this.light,
            frontWheel: this.frontWheel.globalPosition,
            backWheel: this.backWheel.globalPosition,
            length: this.length
        };
        if (!delta) {
            serialized.length = this.length;
            serialized.width = this.width;
            serialized.wheelOffset = this.wheelOffset;
        }
        return serialized;
    }
}

export interface ITrain {
    id: number;
    reversed: boolean;
    light: boolean;
    frontWheel: IPoint2D;
    backWheel: IPoint2D;
    length?: number;
    width?: number;
    wheelOffset?: number;
}

export interface IWheel {
    track: Track;
    forward: boolean;
    distance: number;
    globalPosition: IPoint2D;
}
