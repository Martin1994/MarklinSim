import * as PIXI from 'pixi.js';
import { IPoint2D, distance2D } from '../../util/point2d';
import Bezier = require('bezier-js');
import * as config from '../../config';

export class TrackView {
    private readonly sprite: PIXI.Graphics;

    public constructor() {
        this.sprite = new PIXI.Graphics();
    }

    public draw(straightTracks: IPoint2D[][], bezierTracks: IPoint2D[][]) {
        this.sprite.clear();
        this.sprite.lineStyle(2, 0x3333CC, 1);

        for (const track of straightTracks) {
            const coefficient = config.TRACK_WIDTH / 2 / distance2D(track[0], track[1]);
            const normal: IPoint2D = {
                x: (track[1].y - track[0].y) * coefficient,
                y: (track[0].x - track[1].x) * coefficient
            };

            this.sprite.moveTo(track[0].x + normal.x, track[0].y + normal.y);
            this.sprite.lineTo(track[1].x + normal.x, track[1].y + normal.y);

            this.sprite.moveTo(track[0].x - normal.x, track[0].y - normal.y);
            this.sprite.lineTo(track[1].x - normal.x, track[1].y - normal.y);
        }

        for (const track of bezierTracks) {
            const route = new Bezier(
                track[0].x, track[0].y, track[1].x, track[1].y, track[2].x, track[2].y, track[3].x, track[3].y);

            const inner = route.offset(-config.TRACK_WIDTH / 2) as Bezier[];
            const outer = route.offset(config.TRACK_WIDTH / 2) as Bezier[];

            for (const sub of inner.concat(outer)) {
                const points = sub.points;
                this.sprite.moveTo(points[0].x, points[0].y);
                this.sprite.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
            }
        }
    }

    public getSprite(): PIXI.DisplayObject {
        return this.sprite;
    }
}
