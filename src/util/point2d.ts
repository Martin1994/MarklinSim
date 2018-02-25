export interface IPoint2D {
    x: number;
    y: number;
}

export function distance2D(p1: IPoint2D, p2: IPoint2D) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}
