import { Track, IPositionOnTrack } from './track';
import { IPoint2D, distance2D } from '../util/point2d';
import Bezier = require('bezier-js');
import { WSAESOCKTNOSUPPORT } from 'constants';

export class BezierTrack extends Track {
    protected readonly bezier: Bezier;

    public constructor(id: number, start: IPoint2D, control1: IPoint2D, control2: IPoint2D, end: IPoint2D) {
        const bezier = new Bezier(start, control1, control2, end);
        super(id, start, end, bezier.length());
        this.bezier = bezier;
    }

    public getGlobalPosition(distance: number): IPoint2D {
        return this.bezier.get(this.getTByDistance(distance));
    }

    private getTByDistance(distance: number) {
        if (distance < 0 || distance > this.length) {
            throw new Error("Invalid distance.");
        }

        if (distance === 0) {
            return 0;
        }

        if (distance === this.length) {
            return 1;
        }

        // Interpolation search
        // Performance note: This implementation is not efficient at all.
        // Re-write this piece of code once bezier.js have pointAtDistance method.
        let t: number;
        let tDistance: number;
        let upperBound = 1;
        let upperBoundDistance = this.length;
        let lowerBound = 0;
        let lowerBoundDistance = 0;
        const tolerance = 1e-6;
        do {
            t = (distance - lowerBoundDistance) / (upperBoundDistance - lowerBoundDistance)
                * (upperBound - lowerBound) + lowerBound;
            tDistance = this.bezier.split(0, t).length();
            if (tDistance > distance) {
                upperBound = t;
                upperBoundDistance = tDistance;
            } else {
                lowerBound = t;
                lowerBoundDistance = tDistance;
            }
        } while (Math.abs(tDistance - distance) / distance > tolerance);

        return t;
    }

    public movePassive(
        passiveDistance: number, activePosition: IPoint2D, spacing: number, from?: Track): IPositionOnTrack {
        if (!activePosition || spacing < 0) {
            throw new Error('Invalid passive moving.');
        }

        // Check direction
        let t = this.getTByDistance(passiveDistance);
        const passivePosition = this.bezier.get(t);
        const derivative: IPoint2D = this.bezier.derivative(t);
        const delta: IPoint2D = {
            x: activePosition.x - passivePosition.x,
            y: activePosition.y - passivePosition.y
        };
        const dotProduct = derivative.x * delta.x + derivative.y * delta.y;

        // const helperInitialDistance = distance2D(passivePosition, activePosition);
        // const helperStartDistance = distance2D(this.start, activePosition);
        // const helperEndDistance = distance2D(this.end, activePosition);

        if (dotProduct === 0) {
            return null;
        }
        const forward = dotProduct > 0;
        const pulling = distance2D(passivePosition, activePosition) > spacing;

        // By the intermediate value theorem, the solution lays on this bezier curve.
        // Binary search
        const tolerance = 1e-6 * spacing;
        const tTolerance = 1e-6;
        let upper: number;
        let lower: number;
        let testDistance: number;
        const projection = this.bezier.project(activePosition).t;
        if (forward === pulling) {
            upper = projection > t ? projection : 1;
            lower = t;
        } else {
            upper = t;
            lower = projection < t ? projection : 0;
        }
        do {
            t = (upper + lower) / 2;
            testDistance = distance2D(this.bezier.get(t), activePosition);
            if (testDistance > spacing === forward) {
                lower = t;
            } else {
                upper = t;
            }

            if (t < tTolerance) {
                if (this.previousTrack.track === from) {
                    return null;
                } else {
                    const trackInfo = this.previousTrack;
                    const startPosition = trackInfo.head ? 0 : trackInfo.track.getLength();
                    return trackInfo.track.movePassive(startPosition, activePosition, spacing, this);
                }
            }

            if (1 - t < tTolerance) {
                if (this.nextTrack.track === from) {
                    return null;
                } else {
                    const trackInfo = this.nextTrack;
                    const startPosition = trackInfo.head ? 0 : trackInfo.track.getLength();
                    return trackInfo.track.movePassive(startPosition, activePosition, spacing, this);
                }
            }
        } while (Math.abs(testDistance - spacing) > tolerance);

        return {
            track: this,
            distance: this.bezier.split(0, t).length(),
            forward: forward,
            globalPosition: this.bezier.get(t)
        };
    }

    public getControlPoints(): IPoint2D[] {
        return this.bezier.points;
    }
}
