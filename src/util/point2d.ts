export interface IPoint2D {
    x: number;
    y: number;
}

export function distance2D(p1: IPoint2D, p2: IPoint2D) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}

export function normalize2D(p: IPoint2D) {
    const length = distance2D(p, { x: 0, y: 0 });
    return {
        x: p.x / length,
        y: p.y / length
    };
}

export function dot2D(p1: IPoint2D, p2: IPoint2D) {
    return p1.x * p2.x + p1.y * p2.y;
}

export function rotate2D(p: IPoint2D, rotation: number) {
    return {
        x: Math.cos(rotation) * p.x - Math.sin(rotation) * p.y,
        y: Math.sin(rotation) * p.x + Math.cos(rotation) * p.y,
    };
}

export function direction2D(p: IPoint2D) {
    return Math.atan2(p.y, p.x);
}
