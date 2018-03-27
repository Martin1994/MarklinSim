import { Train } from '../model/train';
import * as config from '../config';
import { ITickPayload, ITrackPortion } from '../util/tick_payload';
import { Track } from '../model/track';
import { StraightTrack } from '../model/straight_track';
import { BezierTrack } from '../model/bezier_track';
import { SwitchDirection, Switch } from '../model/switch';
import { Sensor } from '../model/sensor';

export class MarklinController {
    private readonly trains: Map<number, Train> = new Map<number, Train>();
    private readonly tracks: Map<number, Track> = new Map<number, Track>();
    private readonly switches: Map<number, Switch> = new Map<number, Switch>();
    private reportSensor: (sensors: boolean[]) => void = null;
    private readonly launchTime: number = new Date().getTime();
    private sensorQuantity: number = -1;

    public setSensorReportCallback(reportSensor: (sensors: boolean[]) => void) {
        this.reportSensor = reportSensor;
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

    public requestSensorReporting() {
        if (this.sensorQuantity < 0) {
            for (const track of this.tracks.values()) {
                for (const sensor of track.getSensors()) {
                    if (this.sensorQuantity < sensor.id) {
                        this.sensorQuantity = sensor.id;
                    }
                }
            }
            this.sensorQuantity++;
        }

        const triggered: boolean[] = new Array<boolean>(this.sensorQuantity);
        for (let i = 0; i < this.sensorQuantity; i++) {
            triggered[i] = false;
        }
        for (const train of this.trains.values()) {
            for (const sensor of train.getTriggeredSensors()) {
                triggered[sensor.id] = true;
            }
        }

        setTimeout(() => {
            this.reportSensor(triggered);
        }, config.SENSOR_REPORT_DELAY_MS);
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
            offlineSwitchBezierTracks: [],
            switches: [],
            sensors: []
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
        for (const swytch of this.switches.values()) {
            if (!delta || swytch.directionDirty) {
                let tracks: ITrackPortion[];

                const online = swytch.getOnlineTrack();
                if (online.track instanceof StraightTrack) {
                    tracks = payload.onlineSwitchStraightTracks;
                } else if (online.track instanceof BezierTrack) {
                    tracks = payload.onlineSwitchBezierTracks;
                }
                if (tracks) {
                    tracks.push({
                        track: online.track.getControlPoints(),
                        head: online.head
                    });
                }

                const offline = swytch.getOfflineTrack();
                if (offline.track instanceof StraightTrack) {
                    tracks = payload.offlineSwitchStraightTracks;
                } else if (offline.track instanceof BezierTrack) {
                    tracks = payload.offlineSwitchBezierTracks;
                }
                if (tracks) {
                    tracks.push({
                        track: offline.track.getControlPoints(),
                        head: offline.head
                    });
                }

                swytch.directionDirty = false;
            }
        }

        // Put switch name
        if (!delta) {
            for (const swytch of this.switches.values()) {
                payload.switches.push(swytch.getPositionMetadata());
            }
        }

        // Put sensor name
        if (!delta) {
            for (const track of this.tracks.values()) {
                for (const sensor of track.getSensorMetadata()) {
                    payload.sensors.push(sensor);
                }
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
