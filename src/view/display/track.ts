import * as PIXI from 'pixi.js';
import { IPoint2D, distance2D } from '../../util/point2d';
import Bezier = require('bezier-js');
import * as config from '../../config';
import { ITrackPortion } from '../../util/tick_payload';

export class TrackView {
    private readonly sprite: PIXI.Graphics;

    public constructor() {
        this.sprite = new PIXI.Graphics();
    }

    public renderTracks(straightTracks: IPoint2D[][], bezierTracks: IPoint2D[][]) {
        this.sprite.clear();
        this.sprite.lineStyle(2, 0x3333CC, 1);

        for (const track of straightTracks) {
            this.renderStraightTrack(track);
        }

        for (const track of bezierTracks) {
            this.renderBezierTrack(track);
        }
    }

    private renderStraightTrack(track: IPoint2D[]) {
        track = track.map(TrackView.translate);
        const coefficient = config.PIXEL_PER_CENTIMETER * config.TRACK_WIDTH / 2 / distance2D(track[0], track[1]);
        const normal: IPoint2D = {
            x: (track[1].y - track[0].y) * coefficient,
            y: (track[0].x - track[1].x) * coefficient
        };

        this.sprite.moveTo(track[0].x + normal.x, track[0].y + normal.y);
        this.sprite.lineTo(track[1].x + normal.x, track[1].y + normal.y);

        this.sprite.moveTo(track[0].x - normal.x, track[0].y - normal.y);
        this.sprite.lineTo(track[1].x - normal.x, track[1].y - normal.y);
    }

    private renderBezierTrack(track: IPoint2D[]) {
        track = track.map(TrackView.translate);
        const route = new Bezier(
            track[0].x, track[0].y, track[1].x, track[1].y, track[2].x, track[2].y, track[3].x, track[3].y);

        const inner = route.offset(-config.TRACK_WIDTH * config.PIXEL_PER_CENTIMETER / 2) as Bezier[];
        const outer = route.offset(config.TRACK_WIDTH * config.PIXEL_PER_CENTIMETER / 2) as Bezier[];

        for (const sub of inner.concat(outer)) {
            const points = sub.points;
            this.sprite.moveTo(points[0].x, points[0].y);
            this.sprite.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
        }
    }

    private renderStraightTrackPortion(track: IPoint2D[], head: boolean) {
        let portion: number;
        if (head) {
            portion = config.TURNOUT_PORTION;
        } else {
            portion = 1 - config.TURNOUT_PORTION;
        }
        this.renderStraightTrack([
            {
                x: track[head ? 0 : 1].x,
                y: track[head ? 0 : 1].y
            },
            {
                x: track[0].x * portion + track[1].x * (1 - portion),
                y: track[0].y * portion + track[1].y * (1 - portion)
            }
        ]);
    }

    private renderBezierTrackPortion(track: IPoint2D[], head: boolean) {
        const trackBezier = new Bezier(track);
        if (head) {
            this.renderBezierTrack(trackBezier.split(0, config.TURNOUT_PORTION).points);
        } else {
            this.renderBezierTrack(trackBezier.split(1 - config.TURNOUT_PORTION, 1).points);
        }
    }

    public renderSwitchTracks(
        onlineSwitchStraightTracks: ITrackPortion[],
        onlineSwitchBezierTracks: ITrackPortion[],
        offlineSwitchStraightTracks: ITrackPortion[],
        offlineSwitchBezierTracks: ITrackPortion[]
    ) {
        this.sprite.lineStyle(2, 0xDDDDDD, 1);

        // Seems like a bug. Here we must draw something before draw the real rails.
        // Otherwise one rail will have incorrect colour.
        this.sprite.moveTo(0, 0);
        this.sprite.lineTo(0, 0);

        for (const track of offlineSwitchStraightTracks) {
            this.renderStraightTrackPortion(track.track, track.head);
        }
        for (const track of offlineSwitchBezierTracks) {
            this.renderBezierTrackPortion(track.track, track.head);
        }

        this.sprite.lineStyle(2, 0x3333CC, 1);

        for (const track of onlineSwitchStraightTracks) {
            this.renderStraightTrackPortion(track.track, track.head);
        }
        for (const track of onlineSwitchBezierTracks) {
            this.renderBezierTrackPortion(track.track, track.head);
        }
    }

    public getSprite(): PIXI.DisplayObject {
        return this.sprite;
    }

    /**
     * Translate from track coordication to screen coordinaton
     * @param trackPoint Point with coordination of track.
     * @return Point with coordination of screen.
     */
    public static translate(trackPoint: IPoint2D): IPoint2D {
        return {
            x: config.TRACK_OFFSET_X + trackPoint.x * config.PIXEL_PER_CENTIMETER,
            y: config.TRACK_OFFSET_Y + trackPoint.y * config.PIXEL_PER_CENTIMETER
        };
    }
}
