import { MarklinController } from '../marklin_controller';
import { Train } from '../../model/train';
import { Track } from '../../model/track';
import { TrainFactory } from './train_factory';
import { TrackFactory } from './track_factory';
import { Switch, SwitchDirection } from '../../model/switch';

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

        // Top left
        // Row 1
        TrackFactory.straight(tracks, 0x100, 0, 0, 74.74, 0);
        TrackFactory.bezier(tracks, 0x101, 56.21, 4.75, 64.21, 0.75, 64.74, 0, 74.74, 0);
        Track.connect(tracks[0x100], tracks[0x101]);
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

        // Outer loop

    }

    private static createTrains(trains: Train[], tracks: Track[]) {
        TrainFactory.train(trains, 24);
        trains[24].putOnTrack(tracks[0x100], true);
    }
}
