import { MarklinController } from '../marklin_controller';
import { Train } from '../../model/train';
import { Track } from '../../model/track';
import { TrainFactory } from './train_factory';
import { TrackFactory } from './track_factory';
import { Switch, SwitchDirection } from '../../model/switch';

export class TrackDrift {
    public static setup(controller: MarklinController): void {
        const trains: Train[] = [];
        const tracks: Track[] = [];

        this.createTracks(tracks);
        this.connectTracks(tracks);
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

        const delay = 2500;

        setTimeout(() => {
            controller.setTrainSpeed(24, 14, true);
            controller.changeSwitchDirection(1, SwitchDirection.Curve);
        }, delay);

        setTimeout(() => {
            controller.changeSwitchDirection(1, SwitchDirection.Straight);
        }, 4500 + delay);
    }

    private static createTracks(tracks: Track[]) {
        const scale = 0.5;
        // Main loop
        TrackFactory.straight(tracks, 0x100, 150 * scale, 100 * scale, 650 * scale, 100 * scale);
        TrackFactory.quadrant(tracks, 0x101, 650 * scale, 100 * scale, 700 * scale, 150 * scale);
        TrackFactory.straight(tracks, 0x102, 700 * scale, 150 * scale, 700 * scale, 450 * scale);
        TrackFactory.quadrant(tracks, 0x103, 700 * scale, 450 * scale, 650 * scale, 500 * scale);
        TrackFactory.straight(tracks, 0x104, 650 * scale, 500 * scale, 150 * scale, 500 * scale);
        TrackFactory.quadrant(tracks, 0x105, 150 * scale, 500 * scale, 100 * scale, 450 * scale);
        TrackFactory.straight(tracks, 0x106, 100 * scale, 450 * scale, 100 * scale, 150 * scale);
        TrackFactory.quadrant(tracks, 0x107, 100 * scale, 150 * scale, 150 * scale, 100 * scale);

        // Branch
        TrackFactory.quadrant(tracks, 0x111, 650 * scale, 100 * scale, 710 * scale, 160 * scale);
        TrackFactory.straight(tracks, 0x112, 710 * scale, 160 * scale, 710 * scale, 440 * scale);
        TrackFactory.quadrant(tracks, 0x113, 710 * scale, 440 * scale, 650 * scale, 500 * scale);
    }

    private static connectTracks(tracks: Track[]) {
        Track.connect(tracks[0x101], tracks[0x102]);
        Track.connect(tracks[0x102], tracks[0x103]);

        Track.connect(tracks[0x104], tracks[0x105]);
        Track.connect(tracks[0x105], tracks[0x106]);
        Track.connect(tracks[0x106], tracks[0x107]);
        Track.connect(tracks[0x107], tracks[0x100]);

        Track.connect(tracks[0x111], tracks[0x112]);
        Track.connect(tracks[0x112], tracks[0x113]);

        TrackFactory.switch(tracks, 0x1, tracks[0x100], tracks[0x111], tracks[0x101]);

        TrackFactory.switch(tracks, 0x2, tracks[0x104], tracks[0x113], tracks[0x103]);
    }

    private static createTrains(trains: Train[], tracks: Track[]) {
        TrainFactory.train(trains, 24);
        trains[24].putOnTrack(tracks[0x100], true);
    }
}
