import { ITrain } from '../model/train';
import { IPoint2D } from './point2d';

export interface ITickPayload {
    objectChanged: boolean;
    trains: ITrain[];
    drawTrack: boolean;
    straightTracks: IPoint2D[][];
    bezierTracks: IPoint2D[][];
}
