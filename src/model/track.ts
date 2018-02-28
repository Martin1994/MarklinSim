import { IPoint2D, distance2D } from '../util/point2d';

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

    protected readonly width = 8;

    /** The previous track. Null means no track. */
    protected previousTrack: ITrackConnection = null;

    /** The next track. Null means no track. */
    protected nextTrack: ITrackConnection = null;

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
    public static connect(track1: Track, head1: boolean, track2: Track, head2: boolean) {
        const tolerance = 1e-7;
        if (distance2D(head1 ? track1.start : track1.end, head2 ? track2.start : track2.end) > tolerance) {
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
