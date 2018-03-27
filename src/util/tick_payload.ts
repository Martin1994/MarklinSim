import { ITrain } from '../model/train';
import { IPoint2D } from './point2d';

export interface ITrackPortion {
    track: IPoint2D[];
    head: boolean;
}

export interface ISwitch {
    name: string;
    position: IPoint2D;
    rotation: number;
    turningRight: boolean;
}

export interface ISensor {
    name: string;
    position: IPoint2D;
    rotation: number;
}

export interface ITickPayload {
    time: number;
    objectChanged: boolean;
    trains: ITrain[];
    drawTrack: boolean;
    straightTracks: IPoint2D[][];
    bezierTracks: IPoint2D[][];
    onlineSwitchStraightTracks: ITrackPortion[];
    offlineSwitchStraightTracks: ITrackPortion[];
    onlineSwitchBezierTracks: ITrackPortion[];
    offlineSwitchBezierTracks: ITrackPortion[];
    switches: ISwitch[];
    sensors: ISensor[];
}
