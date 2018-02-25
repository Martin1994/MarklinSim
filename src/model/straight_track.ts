import { distance2D, IPoint2D } from '../util/point2d';
import { Track, IPositionOnTrack } from './track';

export class StraightTrack extends Track {
    public constructor(id: number, start: IPoint2D, end: IPoint2D) {
        super(id, start, end, distance2D(start, end));
    }

    public getGlobalPosition(distance: number): IPoint2D {
        if (distance < 0 || distance > this.length) {
            throw new Error('Invalid distance.');
        }
        const deltaX = this.end.x - this.start.x;
        const deltaY = this.end.y - this.start.y;
        const ratio = distance / this.length;
        return {
            x: this.start.x + deltaX * ratio,
            y: this.start.y + deltaY * ratio
        };
    }

    public movePassive(
        passiveDistance: number, activePosition: IPoint2D, spacing: number, from?: Track): IPositionOnTrack {
        if (!activePosition || spacing < 0) {
            throw new Error('Invalid passive moving.');
        }

        const passivePosition = this.getGlobalPosition(passiveDistance);

        // Get two intersection points on the line
        // Source: http://mathworld.wolfram.com/Circle-LineIntersection.html
        const dx = this.end.x - this.start.x;
        const dy = this.end.y - this.start.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        const D = (this.start.x - activePosition.x) * (this.end.y - activePosition.y)
            - (this.end.x - activePosition.x) * (this.start.y - activePosition.y);
        const delta = spacing * spacing * dr * dr - D * D;

        if (delta < 0) {
            return null;
        }

        const xSymmetric = (dy < 0 ? -1 : 1) * dx * Math.sqrt(delta);
        const ySemmetric = Math.abs(dy) * Math.sqrt(delta);
        const p1 = {
            x: activePosition.x + (D * dy + xSymmetric) / dr / dr,
            y: activePosition.y + (-D * dx + ySemmetric) / dr / dr
        };
        const p2 = {
            x: activePosition.x + (D * dy - xSymmetric) / dr / dr,
            y: activePosition.y + (-D * dx - ySemmetric) / dr / dr
        };

        // Pick a closer one
        const p = (distance2D(passivePosition, p1) < distance2D(passivePosition, p2)) ? p1 : p2;

        // Check whether it is on the line segment
        let location; // 0: On it. 1: After end. -1: Before start.
        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(p.x - this.start.x) > Math.abs(this.end.x - this.start.x)) {
                location = 1;
            } else if (Math.abs(p.x - this.end.x) > Math.abs(this.start.x - this.end.x)) {
                location = -1;
            } else {
                location = 0;
            }
        } else {
            if (Math.abs(p.y - this.start.y) > Math.abs(this.end.y - this.start.y)) {
                location = 1;
            } else if (Math.abs(p.y - this.end.y) > Math.abs(this.start.y - this.end.y)) {
                location = -1;
            } else {
                location = 0;
            }
        }

        if (location === -1) {
            if (this.previousTrack.track === from) {
                return null;
            } else {
                const startingPoint = this.previousTrack.head ? 0 : this.previousTrack.track.getLength();
                return this.previousTrack.track.movePassive(startingPoint, activePosition, spacing, this);
            }
        } else if (location === 1) {
            if (this.nextTrack.track === from) {
                return null;
            } else {
                const startingPoint = this.nextTrack.head ? 0 : this.nextTrack.track.getLength();
                return this.nextTrack.track.movePassive(startingPoint, activePosition, spacing, this);
            }
        } else {
            return {
                track: this,
                distance: distance2D(p, this.start),
                forward: distance2D(activePosition, this.start) > distance2D(p, this.start),
                globalPosition: p
            };
        }
    }

    public getControlPoints(): IPoint2D[] {
        return [this.start, this.end];
    }
}
