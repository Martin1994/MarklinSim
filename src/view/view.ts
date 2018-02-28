import { ITickPayload } from '../util/tick_payload';
import * as PIXI from 'pixi.js';
import { TrainView } from './display/train';
import { TrackView } from './display/track';
import { Dashboard } from './display/dashboard';

export class View {
    private readonly app: PIXI.Application;
    private readonly trains: Map<number, TrainView> = new Map();
    private readonly trackView: TrackView;
    private readonly dashboard: Dashboard;

    public constructor() {
        this.app = new PIXI.Application({width: 800, height: 600, antialias: true});
        this.app.renderer.backgroundColor = 0xffffff;

        this.trackView = new TrackView();
        this.app.stage.addChild(this.trackView.getSprite());

        this.dashboard = new Dashboard();
        this.app.stage.addChild(this.dashboard.getSprite());
    }

    public install() {
        document.body.appendChild(this.app.view);
    }

    public render(payload: ITickPayload) {
        this.dashboard.render(payload.time);

        if (payload.objectChanged) {
            for (const train of payload.trains) {
                if (!this.trains.has(train.id)) {
                    const trainDisplay = new TrainView(train);
                    this.trains.set(train.id, trainDisplay);
                    this.app.stage.addChild(trainDisplay.getSprite());
                }
            }
        }

        for (const trainModel of payload.trains) {
            const trainView = this.trains.get(trainModel.id);
            trainView.render(trainModel);
        }

        if (payload.drawTrack) {
            this.trackView.renderTracks(payload.straightTracks, payload.bezierTracks);
        }

        this.trackView.renderSwitchTracks(
            payload.onlineSwitchStraightTracks,
            payload.onlineSwitchBezierTracks,
            payload.offlineSwitchStraightTracks,
            payload.offlineSwitchBezierTracks
        );
    }
}
