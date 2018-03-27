import { Track } from '../../model/track';
import { StraightTrack } from '../../model/straight_track';
import { BezierTrack } from '../../model/bezier_track';
import { IPoint2D, distance2D } from '../../util/point2d';
import { Switch } from '../../model/switch';

export class TrackFactory {
    /**
     * Generate a straight track.
     */
    public static straight(array: Track[], id: number, startX: number, startY: number, endX: number, endY: number) {
        const start: IPoint2D = {
            x: startX,
            y: startY
        };
        const end: IPoint2D = {
            x: endX,
            y: endY
        };
        array[id] = new StraightTrack(id, start, end);
    }

    /**
     * Generate a bezier track.
     */
    public static bezier(
        array: Track[], id: number, startX: number, startY: number, control1X: number, control1Y: number,
        control2X: number, control2Y: number, endX: number, endY: number) {
        const start: IPoint2D = {
            x: startX,
            y: startY
        };
        const control1: IPoint2D = {
            x: control1X,
            y: control1Y
        };
        const control2: IPoint2D = {
            x: control2X,
            y: control2Y
        };
        const end: IPoint2D = {
            x: endX,
            y: endY
        };
        array[id] = new BezierTrack(id, start, control1, control2, end);
    }

    /**
     * Generate a counter-clockwise quadrant track.
     */
    public static quadrant(array: Track[], id: number, startX: number, startY: number, endX: number, endY: number) {
        // Use cubic bezier curve to approximate a quadrant
        // Source: http://spencermortensen.com/articles/bezier-circle/
        const cOverSqrt2 = 0.5 * 0.55191502449;
        const dx = endX - startX;
        const dy = endY - startY;
        const start: IPoint2D = {
            x: startX,
            y: startY
        };
        const control1: IPoint2D = {
            x: startX + dx * cOverSqrt2 + dy * cOverSqrt2,
            y: startY - dx * cOverSqrt2 + dy * cOverSqrt2
        };
        const control2: IPoint2D = {
            x: endX - dx * cOverSqrt2 + dy * cOverSqrt2,
            y: endY - dx * cOverSqrt2 - dy * cOverSqrt2
        };
        const end: IPoint2D = {
            x: endX,
            y: endY
        };
        array[id] = new BezierTrack(id, start, control1, control2, end);
    }

    public static switch(array: Track[], id: number, branch: Track, straight: Track, curve: Track) {
        // Find connection point
        let position: IPoint2D;
        if (distance2D(straight.getStartPoint(), curve.getStartPoint()) < Track.connectionTolerance) {
            position = straight.getStartPoint();
        } else if (distance2D(straight.getStartPoint(), curve.getEndPoint()) < Track.connectionTolerance) {
            position = straight.getStartPoint();
        } else if (distance2D(straight.getEndPoint(), curve.getStartPoint()) < Track.connectionTolerance) {
            position = straight.getEndPoint();
        } else if (distance2D(straight.getEndPoint(), curve.getEndPoint()) < Track.connectionTolerance) {
            position = straight.getEndPoint();
        } else {
            throw new Error('Invalid switch.');
        }
        if (distance2D(position, branch.getStartPoint()) >= Track.connectionTolerance &&
            distance2D(position, branch.getEndPoint()) >= Track.connectionTolerance) {
            throw new Error('Invalid switch.');
        }

        array[id] = new Switch(id, position);
        (array[id] as Switch).connect(branch, straight, curve);
    }

    public static sensor(track: Track, name: string, distance: number, forward: boolean) {
        if (name.length < 2) {
            throw new Error('Invalid sensor name');
        }
        const module = name.charCodeAt(0) - "A".charCodeAt(0);
        const offset = parseInt(name.substr(1), 10) - 1;
        if (module < 0 || module >= 5) {
            throw new Error('Invalid sensor name');
        }
        if (!isFinite(offset) || offset < 0 || offset >= 16 || offset % 2 === 1) {
            throw new Error('Invalid sensor name');
        }

        if (distance < 0) {
            distance = track.getLength() + distance;
        }

        const id = module * 16 + offset;
        track.addSensor(id, name, distance, forward);
        track.addSensor(id + 1, name.charCodeAt(0) + (offset + 2).toString(10).toUpperCase(), distance, !forward);
    }
}
