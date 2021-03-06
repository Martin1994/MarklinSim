import { IPoint2D, distance2D } from '../util/point2d';
import { Sensor } from './sensor';
import { ISensor } from '../util/tick_payload';

/**
 * The track model. It records which tracks to connect with,
 * and controls the behaviour of active and passive wheel movement.
 *
 * This is the abstract track, which only knows the relative distance to the track's head.
 * It doesn't know the global position of any point on this track. Thus the movement
 * behaviour of passive wheels are controled by specific track implementations.
 */
export abstract class Track {
    public readonly id: number;
    protected readonly length: number;
    protected readonly start: IPoint2D;
    protected readonly end: IPoint2D;

    public static readonly connectionTolerance = 1e-7;

    /** The previous track. Null means no track. */
    protected previousTrack: ITrackConnection = null;

    /** The next track. Null means no track. */
    protected nextTrack: ITrackConnection = null;

    private readonly sensors: Sensor[] = [];

    protected constructor(id: number, start: IPoint2D, end: IPoint2D, length: number) {
        this.id = id;
        this.length = length;
        this.start = start;
        this.end = end;
    }

    public getStartPoint(): IPoint2D {
        return this.start;
    }

    public getEndPoint(): IPoint2D {
        return this.end;
    }

    public getLength(): number {
        return this.length;
    }

    public setPreviousTrack(track: Track, head: boolean) {
        this.previousTrack = { track, head };
    }

    public setNextTrack(track: Track, head: boolean) {
        this.previousTrack = { track, head };
    }

    public addSensor(id: number, name: string, distanceToHead: number, forward: boolean) {
        this.sensors.push(new Sensor(id, name, distanceToHead, forward));
    }

    public getSensors(): Sensor[] {
        return this.sensors;
    }

    /**
     * Return the direction in radian.
     * @param distance Distance to the starting point.
     * @return Rotation from (1, 0) in radian ranged in (-PI, PI].
     */
    public abstract getDirection(distance: number): number;

    public getSensorMetadata(): ISensor[] {
        const sensors: ISensor[] = [];

        for (const sensor of this.sensors) {
            let rotation = (sensor.forward ? 0 : Math.PI) + this.getDirection(sensor.distanceToHead);
            if (rotation > Math.PI) {
                rotation -= Math.PI * 2;
            }
            sensors.push({
                name: sensor.name,
                position: this.getGlobalPosition(sensor.distanceToHead),
                rotation: rotation
            });
        }

        return sensors;
    }

    public getSensorsAt(distance: number, forward: boolean): Sensor[] {
        const sensors: Sensor[] = [];
        for (const sensor of this.sensors) {
            if (forward === sensor.forward && Math.abs(sensor.distanceToHead - distance) < sensor.width / 2) {
                sensors.push(sensor);
            }
        }
        return sensors;
    }

    /**
     * Move on this track.
     *
     * @param position Starting point.
     * @param distance Moving distance. Must be non-negative.
     * @param forward Whether move from its head towards its tail.
     *
     * @return Target position.
     */
    public move(position: number, distance: number, forward: boolean): IPositionOnTrack {
        const targetDistance = forward ? (position + distance) : (position - distance);
        if (targetDistance > this.length) {
            if (this.nextTrack) {
                const startingPoint = this.nextTrack.head ? 0 : this.nextTrack.track.getLength();
                const nextDistance = targetDistance - this.length;
                return this.nextTrack.track.move(startingPoint, nextDistance, this.nextTrack.head);
            } else {
                return null;
            }
        } else if (targetDistance < 0) {
            if (this.previousTrack) {
                const startingPoint = this.previousTrack.head ? 0 : this.previousTrack.track.getLength();
                const nextDistance = -targetDistance;
                return this.previousTrack.track.move(startingPoint, nextDistance, this.previousTrack.head);
            } else {
                return null;
            }
        } else {
            return {
                track: this,
                distance: targetDistance,
                forward: forward,
                globalPosition: this.getGlobalPosition(targetDistance)
            };
        }
    }

    /**
     * Keep a point on this track moving with an active moving point at a fixed spacing.
     *
     * @param passivePosition The global position of the passive moving point
     * @param activePosition The global position of the active moving point
     * @param spacing The fixed spacing.
     * @param from If sepecified, do not search this track, so as to avoid infinite recursion.
     *
     * @return Target position
     */
    public abstract movePassive(
        passiveDistance: number, activePosition: IPoint2D, spacing: number, from?: Track): IPositionOnTrack;

    /**
     * Get the global position of a relative position on this track.
     *
     * @param distance The relative position, i.e. the arc length from the starting point.
     *
     * @return Global position.
     */
    public abstract getGlobalPosition(distance: number): IPoint2D;

    /**
     * Control points for display purpose.
     *
     * @return An array of control points.
     */
    public abstract getControlPoints(): IPoint2D[];

    /**
     * Helper function to connect two tracks.
     *
     * @param track1 The first track.
     * @param head1 Whether to connect the head or the tail of the first track.
     * @param track2 The second track.
     * @param head2 Whether to connect the head or the tail of the second track.
     */
    protected static connectManually(track1: Track, head1: boolean, track2: Track, head2: boolean) {
        const connectionDistance = distance2D(head1 ? track1.start : track1.end, head2 ? track2.start : track2.end);
        if (connectionDistance > this.connectionTolerance) {
            throw new Error('Track connection mismatch.');
        }
        const track1Info: ITrackConnection = {
            track: track1,
            head: head1
        };
        const track2Info: ITrackConnection = {
            track: track2,
            head: head2
        };
        if (head1) {
            track1.previousTrack = track2Info;
        } else {
            track1.nextTrack = track2Info;
        }
        if (head2) {
            track2.previousTrack = track1Info;
        } else {
            track2.nextTrack = track1Info;
        }
    }
    /**
     * Helper function to connect two tracks.
     *
     * @param track1 The first track.
     * @param track2 The second track.
     */
    public static connect(track1: Track, track2: Track) {
        // Find head
        let head1: boolean;
        let head2: boolean;
        if (distance2D(track1.start, track2.start) < this.connectionTolerance) {
            head1 = true;
            head2 = true;
        } else if (distance2D(track1.start, track2.end) < this.connectionTolerance) {
            head1 = true;
            head2 = false;
        } else if (distance2D(track1.end, track2.start) < this.connectionTolerance) {
            head1 = false;
            head2 = true;
        } else if (distance2D(track1.end, track2.end) < this.connectionTolerance) {
            head1 = false;
            head2 = false;
        } else {
            throw new Error(`Track ${track1.id} and track ${track2.id} are not adjacent.`);
        }

        this.connectManually(track1, head1, track2, head2);
    }
}

export interface IPositionOnTrack {
    track: Track;
    distance: number;
    forward: boolean;
    globalPosition: IPoint2D;
}

export interface ITrackConnection {
    track: Track;
    head: boolean;
}
