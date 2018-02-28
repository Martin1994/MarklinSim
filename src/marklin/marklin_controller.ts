import { Train } from '../model/train';
import { MarklinIO } from './marklin_io';
import * as config from '../config';
import { ITickPayload, ITrackPortion } from '../util/tick_payload';
import { Track } from '../model/track';
import { StraightTrack } from '../model/straight_track';
import { BezierTrack } from '../model/bezier_track';
import { SwitchDirection, Switch } from '../model/switch';

export class MarklinController {
    private readonly trains: Map<number, Train> = new Map<number, Train>();
    private readonly tracks: Map<number, Track> = new Map<number, Track>();
    private readonly switches: Map<number, Switch> = new Map<number, Switch>();
    private io: MarklinIO = null;
    private readonly launchTime: number = new Date().getTime();

    public setIO(io: MarklinIO) {
        this.io = io;
    }

    public registerTrain(train: Train) {
        if (this.trains.has(train.id)) {
            console.warn(`Adding duplicate train: ${train.id}.`);
        }
        this.trains.set(train.id, train);
    }

    public registerTrack(track: Track) {
        if (this.tracks.has(track.id)) {
            console.warn(`Adding duplicate track: ${track.id}`);
        }
        this.tracks.set(track.id, track);
        if (track instanceof Switch) {
            this.switches.set(track.id, track);
        }
    }

    public setTrainSpeed(id: number, speed: number, light: boolean) {
        if (!this.trains.has(id)) {
            console.warn(`Setting train speed for train out of track: ${id}.`);
            return;
        }
        const train = this.trains.get(id);
        train.targetSpeed = speed;
        if (train.light !== light) {
            train.lightDirty = true;
        }
        train.light = light;
    }

    public reverseTrain(id: number) {
        if (!this.trains.has(id)) {
            console.warn(`Setting train speed for train out of track: ${id}.`);
            return;
        }
        const train = this.trains.get(id);
        train.reverse();
    }

    public changeSwitchDirection(id: number, direction: SwitchDirection) {
        if (!this.switches.has(id)) {
            console.warn(`Setting train speed for train out of track: ${id}.`);
            return;
        }
        const swytch = this.switches.get(id);
        swytch.changeDirection(direction);
    }

    public tick(interval: number) {
        for (const train of this.trains.values()) {
            // Change speed
            train.accelerate(interval);

            // Change position
            train.move(interval);
        }
    }

    public getTick(delta: boolean) {
        const payload: ITickPayload = {
            time: new Date().getTime() - this.launchTime,
            trains: [],
            objectChanged: !delta,
            drawTrack: !delta,
            straightTracks: delta ? null : [],
            bezierTracks: delta ? null : [],
            onlineSwitchStraightTracks: [],
            offlineSwitchStraightTracks: [],
            onlineSwitchBezierTracks: [],
            offlineSwitchBezierTracks: []
        };

        // Put train info
        for (const train of this.getTrains()) {
            if (!delta || train.positionDirty || train.lightDirty) {
                payload.trains.push(train.serialize(delta));
                train.positionDirty = false;
                train.lightDirty = false;
            }
        }

        // Put track info
        if (!delta) {
            for (const track of this.getTracks()) {
                if (track instanceof StraightTrack) {
                    payload.straightTracks.push(track.getControlPoints());
                } else if (track instanceof BezierTrack) {
                    payload.bezierTracks.push(track.getControlPoints());
                }
            }
        }

        // Put Switch info
        for (const track of this.switches.values()) {
            if (!delta || track.directionDirty) {
                let tracks: ITrackPortion[];

                const online = track.getOnlineTrack();
                if (online.track instanceof StraightTrack) {
                    tracks = payload.onlineSwitchStraightTracks;
                } else if (online.track instanceof BezierTrack) {
                    tracks = payload.onlineSwitchBezierTracks;
                }
                tracks.push({
                    track: online.track.getControlPoints(),
                    head: online.head
                });

                const offline = track.getOfflineTrack();
                if (offline.track instanceof StraightTrack) {
                    tracks = payload.offlineSwitchStraightTracks;
                } else if (offline.track instanceof BezierTrack) {
                    tracks = payload.offlineSwitchBezierTracks;
                }
                tracks.push({
                    track: offline.track.getControlPoints(),
                    head: offline.head
                });

                track.directionDirty = false;
            }
        }

        return payload;
    }

    public getTrains() {
        return this.trains.values();
    }

    public getTracks() {
        return this.tracks.values();
    }
}
