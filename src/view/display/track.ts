import * as PIXI from 'pixi.js';
import { IPoint2D } from '../../util/point2d';

export class TrackView {
    public readonly sprite: PIXI.Graphics;

    public constructor() {
        this.sprite = new PIXI.Graphics();
    }

    public draw(straightTracks: IPoint2D[][], bezierTracks: IPoint2D[][]) {
        this.sprite.clear();
        this.sprite.lineStyle(2, 0x3333CC, 1);

        for (const track of straightTracks) {
            this.sprite.moveTo(track[0].x, track[0].y);
            this.sprite.lineTo(track[1].x, track[1].y);
        }

        for (const track of bezierTracks) {
            this.sprite.moveTo(track[0].x, track[0].y);
            this.sprite.bezierCurveTo(track[1].x, track[1].y, track[2].x, track[2].y, track[3].x, track[3].y);
        }
    }
}
