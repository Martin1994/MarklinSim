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
     * @param branch The branched track.
     * @param straight The straight track.
     * @param curve The curve track.
     */
    public connect(branch: Track, straight: Track, curve: Track) {
        // Find heads
        let branchHead: boolean;
        let straightHead: boolean;
        let curveHead: boolean;

        if (distance2D(this.start, branch.getStartPoint()) < Track.connectionTolerance) {
            branchHead = true;
        } else if (distance2D(this.start, branch.getEndPoint()) < Track.connectionTolerance) {
            branchHead = false;
        } else {
            throw new Error(`Switch ${this.id} and track ${branch.id} are not adjacent.`);
        }

        if (distance2D(this.start, straight.getStartPoint()) < Track.connectionTolerance) {
            straightHead = true;
        } else if (distance2D(this.start, straight.getEndPoint()) < Track.connectionTolerance) {
            straightHead = false;
        } else {
            throw new Error(`Switch ${this.id} and track ${straight.id} are not adjacent.`);
        }

        if (distance2D(this.start, curve.getStartPoint()) < Track.connectionTolerance) {
            curveHead = true;
        } else if (distance2D(this.start, curve.getEndPoint()) < Track.connectionTolerance) {
            curveHead = false;
        } else {
            throw new Error(`Switch ${this.id} and track ${curve.id} are not adjacent.`);
        }

        const originalDirection = this.direction;
        Track.connectManually(this, true, branch, branchHead);
        this.changeDirection(SwitchDirection.Straight);
        Track.connectManually(this, false, straight, straightHead);
        this.changeDirection(SwitchDirection.Curve);
        Track.connectManually(this, false, curve, curveHead);
        this.changeDirection(originalDirection);
    }
}
