import { Track, IPositionOnTrack, ITrackConnection } from './track';
import { IPoint2D, distance2D } from '../util/point2d';

export enum SwitchDirection {
    Straight,
    Curve
}

/**
 * The switch model. A switch is a special track, which always has zero length, and whose
 * previous track is fixed but next track can be changed by methods calls.
 */
export class Switch extends Track {

    private direction: SwitchDirection = SwitchDirection.Straight;
    private offlineTrack: ITrackConnection = null;

    public directionDirty: boolean = true;

    public constructor(id: number, position: IPoint2D) {
        super(id, position, position, 0);
    }

    /**
     * Change the direction of this switch.
     *
     * @param direction The target direction.
     */
    public changeDirection(direction: SwitchDirection) {
        if (this.direction !== direction) {
            const trackTemp: ITrackConnection = this.offlineTrack;
            this.offlineTrack = this.nextTrack;
            this.nextTrack = trackTemp;
            this.direction = direction;
            this.directionDirty = true;
        }
    }

    public movePassive(
        passiveDistance: number, activePosition: IPoint2D, spacing: number, from?: Track): IPositionOnTrack {
        if (!from) {
            throw new Error('Invalid operation.');
        } else if (from === this.nextTrack.track) {
            const startingPoint = this.previousTrack.head ? 0 : this.previousTrack.track.getLength();
            return this.previousTrack.track.movePassive(startingPoint, activePosition, spacing, this);
        } else if (from === this.previousTrack.track) {
            const startingPoint = this.nextTrack.head ? 0 : this.nextTrack.track.getLength();
            return this.nextTrack.track.movePassive(startingPoint, activePosition, spacing, this);
        } else if (from === this.offlineTrack.track) {
            const startingPoint = this.previousTrack.head ? 0 : this.previousTrack.track.getLength();
            console.warn('Unsafe switch position.');
            return this.previousTrack.track.movePassive(startingPoint, activePosition, spacing, this);
        } else {
            throw new Error('Invalid operation.');
        }
    }

    public getGlobalPosition(distance: number): IPoint2D {
        return this.start;
    }

    public getControlPoints(): IPoint2D[] {
        throw new Error('Invalid operation.');
    }

    public getOnlineTrack(): ITrackConnection {
        return {
            track: this.nextTrack.track,
            head: this.nextTrack.head
        };
    }

    public getOfflineTrack(): ITrackConnection {
        return {
            track: this.offlineTrack.track,
            head: this.offlineTrack.head
        };
    }

    /**
     * Helper function to connect switch's next tracks.
     *
     * @param track1 The straight track.
     * @param head1 Whether to connect the head or the tail of the straight track.
     * @param track2 The curve track.
     * @param head2 Whether to connect the head or the tail of the curve track.
     */
    public connect(track1: Track, head1: boolean, track2: Track, head2: boolean) {
        const direction = this.direction;
        this.changeDirection(SwitchDirection.Straight);
        Track.connect(this, false, track1, head1);
        this.changeDirection(SwitchDirection.Curve);
        Track.connect(this, false, track2, head2);
        this.changeDirection(direction);
    }
}
