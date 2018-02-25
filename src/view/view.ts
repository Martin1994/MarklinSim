import { ITickPayload } from '../util/tick_payload';
import * as PIXI from 'pixi.js';
import { TrainView } from './display/train';
import { TrackView } from './display/track';

export class View {
    private readonly app: PIXI.Application;
    private readonly trains: Map<number, TrainView> = new Map();
    private readonly trackView: TrackView;

    public constructor() {
        this.app = new PIXI.Application({width: 800, height: 600, antialias: true});
        this.app.renderer.backgroundColor = 0xffffff;
        this.trackView = new TrackView();
        this.app.stage.addChild(this.trackView.sprite);
    }

    public install() {
        document.body.appendChild(this.app.view);
    }

    public render(payload: ITickPayload) {
        if (payload.objectChanged) {
            for (const train of payload.trains) {
                if (!this.trains.has(train.id)) {
                    const trainDisplay = new TrainView(train);
                    this.trains.set(train.id, trainDisplay);
                    this.app.stage.addChild(trainDisplay.getSprite());
                }
            }
        }

        for (const train of payload.trains) {
            const trainDisplay = this.trains.get(train.id);
            const trainDisplayObject = trainDisplay.getSprite();
            trainDisplayObject.x = train.frontWheel.x;
            trainDisplayObject.y = train.frontWheel.y;
            trainDisplayObject.rotation = Math.atan2(
                train.frontWheel.y - train.backWheel.y,
                train.frontWheel.x - train.backWheel.x
            );
            if (train.light !== trainDisplay.isLightOn() || train.reversed !== trainDisplay.isReversed()) {
                if (train.light) {
                    trainDisplay.turnLightOn(train.reversed);
                } else {
                    trainDisplay.turnLightOff();
                }
            }
        }

        if (payload.drawTrack) {
            this.trackView.draw(payload.straightTracks, payload.bezierTracks);
        }
    }
}
