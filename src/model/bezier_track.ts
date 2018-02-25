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
        } while (Math.abs(tDistance - distance) / distance < tolerance);

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

        // Check boundary
        if (forward === pulling) {
            if (distance2D(this.end, activePosition) > spacing === pulling) {
                if (from === this.nextTrack.track) {
                    return null;
                } else {
                    const startingPoint = this.nextTrack.head ? 0 : this.nextTrack.track.getLength();
                    return this.nextTrack.track.movePassive(startingPoint, activePosition, spacing, this);
                }
            }
        } else {
            if (distance2D(this.start, activePosition) > spacing === pulling) {
                if (from === this.previousTrack.track) {
                    return null;
                } else {
                    const startingPoint = this.previousTrack.head ? 0 : this.previousTrack.track.getLength();
                    return this.previousTrack.track.movePassive(startingPoint, activePosition, spacing, this);
                }
            }
        }

        // By the intermediate value theorem, the solution lays on this bezier curve.
        // Binary search
        const tolerance = 1e-6 * spacing;
        let upper: number;
        let lower: number;
        let testDistance: number;
        if (forward === pulling) {
            upper = 1;
            lower = t;
        } else {
            upper = t;
            lower = 0;
        }
        do {
            t = (upper + lower) / 2;
            testDistance = distance2D(this.bezier.get(t), activePosition);
            if (testDistance > spacing === forward) {
                lower = t;
            } else {
                upper = t;
            }
        } while (Math.abs(testDistance - spacing) > tolerance);

        return {
            track: this,
            distance: this.bezier.split(0, t).length(),
            forward: forward,
            globalPosition: this.bezier.get(t)
        };
    }

    public movePassive2(
        passivePosition: IPoint2D, activePosition: IPoint2D, spacing: number, from?: Track): IPositionOnTrack {
        if (!activePosition || spacing < 0) {
            throw new Error('Invalid passive moving.');
        }

        // Check intersections with a circle approximation
        // Source: http://spencermortensen.com/articles/bezier-circle/
        const c = 0.551915024494 * spacing;
        const oX = activePosition.x;
        const oY = activePosition.y;
        const circleSegments = [
            new Bezier(oX, spacing + oY, c + oX, spacing + oY, spacing + oX, c + oY, spacing + oX, oY),
            new Bezier(spacing + oX, oY, spacing + oX, -c + oY, c + oX, -spacing + oY, oX, -spacing + oY),
            new Bezier(oX, -spacing + oY, -c + oX, -spacing + oY, -spacing + oX, -c + oY, -spacing + oX, oY),
            new Bezier(-spacing + oX, oY, -spacing + oX, c + oY, -c + oX, spacing + oY, oX, spacing + oY)
        ];
        const intersections: number[] = [];
        for (const segment of circleSegments) {
            for (const pairStr of (this.bezier.intersects(segment) as string[])) {
                intersections.push(Number.parseFloat(pairStr.split('/')[0]));
            }
        }

        // Choose the closest one
        let minDistance = Infinity;
        let minPoint = null;
        let minT = 0;
        for (const t of intersections) {
            const p = this.bezier.get(t);
            const distance = distance2D(p, passivePosition);
            if (distance < minDistance) {
                minDistance = distance;
                minPoint = p;
                minT = t;
            }
        }

        if (minPoint) {
            return {
                track: this,
                distance: this.bezier.split(0, minT).length(),
                forward: distance2D(activePosition, this.start) > distance2D(minPoint, this.end),
                globalPosition: minPoint
            };
        } else if (distance2D(activePosition, this.start) < distance2D(activePosition, this.end)) {
            if (this.previousTrack.track === from) {
                return null;
            } else {
                //return this.previousTrack.track.movePassive(this.start, activePosition, spacing, this);
            }
        } else {
            if (this.nextTrack.track === from) {
                return null;
            } else {
                //return this.nextTrack.track.movePassive(this.start, activePosition, spacing, this);
            }
        }
    }

    public getControlPoints(): IPoint2D[] {
        return this.bezier.points;
    }
}
