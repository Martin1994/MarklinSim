import { MarklinController } from '../marklin_controller';
import { Train } from '../../model/train';
import { Track } from '../../model/track';
import { TrainFactory } from './train_factory';
import { TrackFactory } from './track_factory';
import { Switch, SwitchDirection } from '../../model/switch';
import { IPoint2D } from '../../util/point2d';

export class TrackA {
    public static setup(controller: MarklinController): void {
        const trains: Train[] = [];
        const tracks: Track[] = [];

        this.createTracks(tracks);
        this.createTrains(trains, tracks);

        for (const train of trains) {
            if (!train) {
                continue;
            }
            controller.registerTrain(train);
        }
        for (const track of tracks) {
            if (!track) {
                continue;
            }
            controller.registerTrack(track);
        }
    }

    private static createTracks(tracks: Track[]) {
        const switches: Switch[] = tracks as Switch[];

        //#region Top left
        // Row 1
        TrackFactory.straight(tracks, 0x100, 0, 0, 74.74, 0);
        TrackFactory.bezier(tracks, 0x101, 56.21, 4.75, 64.21, 0.75, 64.74, 0, 74.74, 0);
        // Row 2
        TrackFactory.straight(tracks, 0x102, 0, 9.5, 37.68, 9.5);
        TrackFactory.bezier(tracks, 0x103, 37.68, 9.5, 47.68, 9.5, 48.21, 8.75, 56.21, 4.75);
        Track.connect(tracks[0x102], tracks[0x103]);
        // Row 3
        TrackFactory.straight(tracks, 0x104, 0, 19, 18.84, 19);
        TrackFactory.bezier(tracks, 0x105, 18.84, 19, 28.84, 19, 40.21, 12.75, 56.21, 4.75);
        Track.connect(tracks[0x104], tracks[0x105]);
        // Entrance
        TrackFactory.straight(tracks, 0x106, 74.74, 0, 94.64, 0);
        // Switches
        TrackFactory.switch(tracks, 12, tracks[0x106], tracks[0x100], tracks[0x101]);
        TrackFactory.switch(tracks, 4, tracks[0x101], tracks[0x105], tracks[0x103]);
        // Sensors
        TrackFactory.sensor(tracks[0x100], "A1", 47.48, true);
        TrackFactory.sensor(tracks[0x102], "A13", 28.54, true);
        TrackFactory.sensor(tracks[0x104], "A15", 9.6, true);
        //#endregion

        //#region Outer loop
        // Straight skeletons
        TrackFactory.straight(tracks, 0x110, 94.64, 0, 174.4, 0);
        TrackFactory.straight(tracks, 0x111, 201.82, 36.92, 201.82, 52.42);
        TrackFactory.straight(tracks, 0x112, 94.64, 89.34, 164.98, 89.34);
        TrackFactory.straight(tracks, 0x113, 59, 36.92, 59, 52.42);
        TrackFactory.straight(tracks, 0x114, 164.98, 89.34, 174.4, 89.34);
        // Right curves
        TrackFactory.quadrant(tracks, 0x116, 174.4, 0, 201.82, 27.42);
        TrackFactory.straight(tracks, 0x117, 201.82, 36.92, 201.82, 27.42);
        TrackFactory.quadrant(tracks, 0x118, 201.82, 61.92, 174.4, 89.34);
        TrackFactory.straight(tracks, 0x119, 201.82, 61.92, 201.82, 52.42);
        // Left curves
        TrackFactory.bezier(tracks, 0x11A, 59, 36.92, 59, 30.92, 60, 28.12, 62, 23.12);
        TrackFactory.bezier(tracks, 0x11B, 59, 52.42, 59, 58.42, 60, 61.22, 62, 66.22);
        TrackFactory.bezier(tracks, 0x11C, 94.64, 0, 73.64, 0, 64, 18.12, 62, 23.12);
        TrackFactory.bezier(tracks, 0x11D, 94.64, 89.34, 73.64, 89.34, 64, 71.22, 62, 66.22);
        Track.connect(tracks[0x11A], tracks[0x113]);
        Track.connect(tracks[0x11B], tracks[0x113]);
        // Connections
        Track.connect(tracks[0x110], tracks[0x116]);
        Track.connect(tracks[0x117], tracks[0x116]);
        Track.connect(tracks[0x114], tracks[0x118]);
        Track.connect(tracks[0x119], tracks[0x118]);
        TrackFactory.switch(tracks, 11, tracks[0x110], tracks[0x106], tracks[0x11C]);
        // Sensor
        TrackFactory.sensor(tracks[0x110], "C13", 9.42, true);
        TrackFactory.sensor(tracks[0x110], "E7", -9.42, true);
        TrackFactory.sensor(tracks[0x116], "D7", 21.52, true);
        TrackFactory.sensor(tracks[0x118], "D9", -21.52, true);
        TrackFactory.sensor(tracks[0x11A], "A3", 9.5, true);
        TrackFactory.sensor(tracks[0x11B], "B15", 9.5, false);
        TrackFactory.sensor(tracks[0x11D], "C5", 9.5, false);
        TrackFactory.sensor(tracks[0x114], "E11", 3.88, true);
        TrackFactory.sensor(tracks[0x112], "C15", 18.9, true);
        TrackFactory.sensor(tracks[0x112], "D11", -18.9, false);
        //#endregion

        //#region Inner loop
        // Top and bottom stright
        TrackFactory.straight(tracks, 0x120, 94.64, 9.5, 164.98, 9.5);
        TrackFactory.straight(tracks, 0x121, 174.4, 9.5, 164.98, 9.5);
        TrackFactory.straight(tracks, 0x122, 94.64, 79.84, 164.98, 79.84);
        TrackFactory.straight(tracks, 0x123, 174.4, 79.84, 164.98, 79.84);
        TrackFactory.straight(tracks, 0x124, 86.89, 9.5, 94.64, 9.5);
        TrackFactory.straight(tracks, 0x125, 86.89, 79.84, 94.64, 79.84);
        // Right curves
        TrackFactory.quadrant(tracks, 0x126, 174.4, 9.5, 201.82, 36.92);
        TrackFactory.quadrant(tracks, 0x128, 201.82, 52.42, 174.4, 79.84);
        Track.connect(tracks[0x121], tracks[0x126]);
        Track.connect(tracks[0x123], tracks[0x128]);
        TrackFactory.switch(tracks, 9, tracks[0x111], tracks[0x117], tracks[0x126]);
        TrackFactory.switch(tracks, 8, tracks[0x111], tracks[0x119], tracks[0x128]);
        // Left curves
        TrackFactory.bezier(tracks, 0x12C, 86.89, 9.5, 73.64, 9.5, 64, 18.12, 62, 23.12);
        TrackFactory.bezier(tracks, 0x12D, 86.89, 79.84, 73.64, 79.84, 64, 71.22, 62, 66.22);
        Track.connect(tracks[0x12C], tracks[0x124]);
        Track.connect(tracks[0x12D], tracks[0x125]);
        TrackFactory.switch(tracks, 14, tracks[0x11A], tracks[0x11C], tracks[0x12C]);
        TrackFactory.switch(tracks, 15, tracks[0x11B], tracks[0x11D], tracks[0x12D]);
        // Sensor
        TrackFactory.sensor(tracks[0x126], "D5", 21.52, false);
        TrackFactory.sensor(tracks[0x128], "E9", -21.52, false);
        TrackFactory.sensor(tracks[0x121], "E5", 3.88, false);
        TrackFactory.sensor(tracks[0x123], "E13", 3.88, true);
        TrackFactory.sensor(tracks[0x120], "B5", 18.9, true);
        TrackFactory.sensor(tracks[0x120], "D3", -18.9, true);
        TrackFactory.sensor(tracks[0x122], "B1", 18.9, true);
        TrackFactory.sensor(tracks[0x122], "D13", -18.9, false);
        TrackFactory.sensor(tracks[0x12C], "C11", 9.5, false);
        TrackFactory.sensor(tracks[0x12D], "C9", 9.5, true);
        //#endregion

        //#region Cross
        // Curves
        TrackFactory.quadrant(tracks, 0x132, 94.64, 9.5, 129.81, 44.67);
        TrackFactory.quadrant(tracks, 0x133, 129.81, 44.67, 164.98, 9.5);
        TrackFactory.quadrant(tracks, 0x134, 129.81, 44.67, 94.64, 79.84);
        TrackFactory.quadrant(tracks, 0x135, 164.98, 79.84, 129.81, 44.67);
        // Deadends
        TrackFactory.straight(tracks, 0x13A, 129.81, 44.67, 129.81, 19.67);
        TrackFactory.straight(tracks, 0x13B, 129.81, 44.67, 129.81, 69.67);
        // Switches to inner curve
        TrackFactory.switch(tracks, 13, tracks[0x124], tracks[0x120], tracks[0x132]);
        TrackFactory.switch(tracks, 10, tracks[0x121], tracks[0x120], tracks[0x133]);
        TrackFactory.switch(tracks, 16, tracks[0x125], tracks[0x122], tracks[0x134]);
        TrackFactory.switch(tracks, 17, tracks[0x123], tracks[0x122], tracks[0x135]);
        // 6 way switch
        const middlePoint: IPoint2D = { x: 129.81, y: 44.67 };
        tracks[0x99] = new Switch(0x99, middlePoint);
        tracks[0x9A] = new Switch(0x9A, middlePoint);
        tracks[0x9B] = new Switch(0x9B, middlePoint);
        tracks[0x9C] = new Switch(0x9C, middlePoint);
        (tracks[0x99] as Switch).connect(tracks[0x9A], tracks[0x13B], tracks[0x134]);
        (tracks[0x9B] as Switch).connect(tracks[0x9C], tracks[0x13A], tracks[0x133]);
        (tracks[0x9A] as Switch).connect(tracks[0x9C], tracks[0x99], tracks[0x135]);
        (tracks[0x9C] as Switch).connect(tracks[0x9A], tracks[0x9B], tracks[0x132]);
        // Sensor
        TrackFactory.sensor(tracks[0x132], "E15", 20, false);
        TrackFactory.sensor(tracks[0x132], "E1", -20, true);
        TrackFactory.sensor(tracks[0x133], "D1", 20, false);
        TrackFactory.sensor(tracks[0x133], "E3", -20, false);
        TrackFactory.sensor(tracks[0x134], "C1", 20, true);
        TrackFactory.sensor(tracks[0x134], "B3", -20, false);
        TrackFactory.sensor(tracks[0x135], "D15", 20, true);
        TrackFactory.sensor(tracks[0x135], "B13", -20, true);
        //#endregion

        //#region Bottom straight
        TrackFactory.straight(tracks, 0x140, 94.64, 98.84, 122.06, 98.84);
        TrackFactory.straight(tracks, 0x141, 137.56, 98.84, 122.06, 98.84);
        TrackFactory.straight(tracks, 0x142, 137.56, 98.84, 196, 98.84);
        TrackFactory.bezier(tracks, 0x144, 94.64, 89.34, 108.64, 89.34, 108.06, 98.84, 122.06, 98.84);
        TrackFactory.bezier(tracks, 0x145, 164.98, 89.34, 150.98, 89.34, 151.56, 98.84, 137.56, 98.84);
        TrackFactory.switch(tracks, 18, tracks[0x141], tracks[0x140], tracks[0x144]);
        TrackFactory.switch(tracks, 6, tracks[0x11D], tracks[0x112], tracks[0x144]);
        TrackFactory.switch(tracks, 5, tracks[0x141], tracks[0x142], tracks[0x145]);
        TrackFactory.switch(tracks, 7, tracks[0x114], tracks[0x112], tracks[0x145]);
        // Sensors
        TrackFactory.sensor(tracks[0x142], "C3", 20, true);
        TrackFactory.sensor(tracks[0x140], "C7", -19, true);
        //#endregion

        //#region Bottom left
        // Row 1
        TrackFactory.straight(tracks, 0x158, 0, 70.34, 19.9, 70.34);
        TrackFactory.bezier(tracks, 0x159, 19.9, 70.34, 29.9, 70.34, 41.27, 75.59, 57.27, 84.59);
        Track.connect(tracks[0x158], tracks[0x159]);
        // Row 2
        TrackFactory.straight(tracks, 0x154, 0, 79.84, 38.74, 79.84);
        TrackFactory.bezier(tracks, 0x155, 38.74, 79.84, 48.74, 79.84, 49.27, 80.59, 57.27, 84.59);
        TrackFactory.straight(tracks, 0x156, 57.27, 84.59, 76.11, 94.09);
        Track.connect(tracks[0x154], tracks[0x155]);
        // Row 3
        TrackFactory.straight(tracks, 0x152, 0, 89.34, 57.58, 89.34);
        TrackFactory.bezier(tracks, 0x153, 57.58, 89.34, 67.58, 89.34, 68.11, 90.09, 76.11, 94.09);
        Track.connect(tracks[0x152], tracks[0x153]);
        // Row 4
        TrackFactory.straight(tracks, 0x150, 0, 98.84, 94.64, 98.84);
        TrackFactory.bezier(tracks, 0x151, 76.11, 94.09, 84.11, 98.09, 84.64, 98.84, 94.64, 98.84);
        // Switches
        TrackFactory.switch(tracks, 1, tracks[0x156], tracks[0x159], tracks[0x155]);
        TrackFactory.switch(tracks, 2, tracks[0x151], tracks[0x156], tracks[0x153]);
        TrackFactory.switch(tracks, 3, tracks[0x140], tracks[0x150], tracks[0x151]);
        // Sensors
        TrackFactory.sensor(tracks[0x158], "A11", 9.42, true);
        TrackFactory.sensor(tracks[0x154], "A9", -19, false);
        TrackFactory.sensor(tracks[0x154], "B7", 9.42, true);
        TrackFactory.sensor(tracks[0x152], "A7", -19, false);
        TrackFactory.sensor(tracks[0x152], "B11", 9.42, true);
        TrackFactory.sensor(tracks[0x150], "A5", -19, true);
        TrackFactory.sensor(tracks[0x150], "B9", 9.42, true);
        //#endregion
    }

    private static createTrains(trains: Train[], tracks: Track[]) {
        TrainFactory.train(trains, 24);
        trains[24].putOnTrack(tracks[0x100], true);
        TrainFactory.train(trains, 58);
        trains[58].putOnTrack(tracks[0x150], true);
    }
}
