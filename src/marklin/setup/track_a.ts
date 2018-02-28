import { MarklinController } from '../marklin_controller';
import { Train } from '../../model/train';
import { Track } from '../../model/track';
import { TrainFactory } from './train_factory';
import { TrackFactory } from './track_factory';
import { Switch, SwitchDirection } from '../../model/switch';

export class MarklinTrackA {
    public static setup(controller: MarklinController): void {
        const trains: Train[] = [];
        const tracks: Track[] = [];

        this.createTrains(trains);
        this.createTracks(tracks);
        this.connectTracks(tracks);
        this.putTrains(trains, tracks);

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

        controller.setTrainSpeed(71, 14, true);
        controller.changeSwitchDirection(1, SwitchDirection.Curve);

        setTimeout(() => {
            controller.reverseTrain(71);
            controller.setTrainSpeed(71, 14, true);
        }, 30000);

        setTimeout(() => {
            controller.changeSwitchDirection(1, SwitchDirection.Straight);
        }, 7500);
    }

    private static createTrains(trains: Train[]) {
        TrainFactory.train(trains, 24);
        TrainFactory.train(trains, 58);
        TrainFactory.train(trains, 71);
    }

    private static createTracks(tracks: Track[]) {
        // Main loop
        TrackFactory.straight(tracks, 0x100, 150, 100, 650, 100);
        TrackFactory.quadrant(tracks, 0x101, 650, 100, 700, 150);
        TrackFactory.straight(tracks, 0x102, 700, 150, 700, 450);
        TrackFactory.quadrant(tracks, 0x103, 700, 450, 650, 500);
        TrackFactory.straight(tracks, 0x104, 650, 500, 150, 500);
        TrackFactory.quadrant(tracks, 0x105, 150, 500, 100, 450);
        TrackFactory.straight(tracks, 0x106, 100, 450, 100, 150);
        TrackFactory.quadrant(tracks, 0x107, 100, 150, 150, 100);

        // Branch
        TrackFactory.switch(tracks, 0x1, 650, 100);
        TrackFactory.quadrant(tracks, 0x111, 650, 100, 725, 175);
        TrackFactory.straight(tracks, 0x112, 725, 175, 725, 425);
        TrackFactory.quadrant(tracks, 0x113, 725, 425, 650, 500);
        TrackFactory.switch(tracks, 0x2, 650, 500);
    }

    private static connectTracks(tracks: Track[]) {
        Track.connect(tracks[0x101], false, tracks[0x102], true);
        Track.connect(tracks[0x102], false, tracks[0x103], true);

        Track.connect(tracks[0x104], false, tracks[0x105], true);
        Track.connect(tracks[0x105], false, tracks[0x106], true);
        Track.connect(tracks[0x106], false, tracks[0x107], true);
        Track.connect(tracks[0x107], false, tracks[0x100], true);

        Track.connect(tracks[0x111], false, tracks[0x112], true);
        Track.connect(tracks[0x112], false, tracks[0x113], true);

        Track.connect(tracks[0x100], false, tracks[0x1], true);
        (tracks[0x1] as Switch).connect(tracks[0x111], true, tracks[0x101], true);

        Track.connect(tracks[0x104], true, tracks[0x2], true);
        (tracks[0x2] as Switch).connect(tracks[0x113], false, tracks[0x103], false);
    }

    private static putTrains(trains: Train[], tracks: Track[]) {
        trains[24].putOnTrack(tracks[0x100], true);
        trains[58].putOnTrack(tracks[0x100], true);
        trains[71].putOnTrack(tracks[0x100], true);
    }
}
